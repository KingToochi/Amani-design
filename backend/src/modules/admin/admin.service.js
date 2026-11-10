import User from "../../models/User.js"
import Product from "../../models/Product.js"
import Sales from "../../models/Sales.js"
import Order from "../../models/Order.js"
import mongoose from "mongoose";
import { validateAdmin, validateAdminAccessCode } from "./admin.validation.js"
import bcrypt from "bcryptjs";
import {generateToken} from "../../utils/generateToken.js"
import { sendApprovalEmail, sendRejectionEmail } from "../../integrations/email/email.service.js";
import { updateOrderStatusFromItems } from "../../utils/updateOrderStatus.js";
import { randomUUID } from "crypto";
import Payment from "../../models/Payment.js";
import { initiateTransfer } from "../../integrations/paystack/initiateTransfer.js";
import { finalizeTransfer } from "../../integrations/paystack/finalizeTransfer.js";
import { createTransferRecipient } from "../../integrations/paystack/transferRecipient.js";




export const fetchAdmin = async(auth) => {
    const user = await User.findOne({_id: auth._id})
    const validate = validateAdmin(user)

    const adminDetails = {
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      profilePicture: user.profilePicture,
      joinedAt: user.joinedAt,
    }

    return adminDetails
    
} 

export const loginAdmin = async({email, password}) => {
   const loginIdentifier = String(email).trim().toLowerCase();
   console.log(loginIdentifier)
      const user = await User.findOne({
        $or: [
                { email: { $regex: `^${loginIdentifier}$`, $options: "i" } },
                { username: { $regex: `^${loginIdentifier}$`, $options: "i" } }
            ]
        });
      const validate = validateAdmin(user)
      const hashedPassword = user.password
      console.log(hashedPassword)
      console.log(password)
      console.log(user)
      const ismatch = await bcrypt.compare(password, hashedPassword)
      if (!ismatch){
        const error = new Error("Incorrect password")
        error.statusCode = 401
        throw error
      } 
      const accessToken = await generateToken(loginIdentifier, { expiresIn: "15m" })
      const refreshToken = await generateToken(loginIdentifier, { expiresIn: "7d" })
      return {accessToken, refreshToken, user: user}
}

export const fetchVendorDetails = async(auth) => {
     const user = await User.findOne({_id: auth._id})
     const validate = validateAdmin(user)
     const vendors = await User.find({role: "vendor"}).select("id fname lname username email phoneNumber typeOfVendor status subscriber subscriptionDetails.plan subscriptionDetails.status joinedAt")
     return vendors
}

const getVendorOrderPayouts = async () => {
  const orderItems = await Order.aggregate([
    {
      $match: {
        paymentStatus: "successful",
        "items.status": { $in: ["delivered", "in_transit"] }
      }
    },
    { $unwind: "$items" },
    {
      $addFields: {
        "items.productObjectId": {
          $convert: {
            input: "$items.productId",
            to: "objectId",
            onError: null,
            onNull: null
          }
        },
        "items.receiptMatches": {
          $filter: {
            input: { $ifNull: ["$customerOrderReceivedDetails", []] },
            as: "receipt",
            cond: {
              $and: [
                {
                  $eq: [
                    { $toString: "$$receipt.itemId" },
                    { $toString: "$items._id" }
                  ]
                },
                {
                  $or: [
                    { $eq: ["$$receipt.receivedItem", true] },
                    { $ne: ["$$receipt.receivedAt", null] },
                    { $in: ["$$receipt.itemStatus", ["received", "partially_received"]] }
                  ]
                }
              ]
            }
          }
        }
      }
    },
    {
      $match: {
        $or: [
          { "items.status": "delivered" },
          {
            "items.status": "in_transit",
            $expr: { $eq: [{ $size: "$items.receiptMatches" }, 0] }
          }
        ]
      }
    },
    {
      $lookup: {
        from: Product.collection.name,
        localField: "items.productObjectId",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    {
      $lookup: {
        from: User.collection.name,
        localField: "product.vendorId",
        foreignField: "_id",
        as: "vendor"
      }
    },
    { $unwind: "$vendor" },
    { $match: { "vendor.role": "vendor" } },
    {
      $project: {
        _id: 0,
        vendorId: "$vendor._id",
        vendorName: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: ["$vendor.fname", ""] },
                " ",
                { $ifNull: ["$vendor.lname", ""] }
              ]
            }
          }
        },
        vendorEmail: "$vendor.email",
        vendorPhoneNumber: "$vendor.phoneNumber",
        order: {
          orderId: "$_id",
          orderNumber: "$orderNumber",
          paymentStatus: "$paymentStatus",
          paymentReference: "$paymentReference",
          orderStatus: "$orderStatus",
          customerName: "$customerName",
          customerEmail: "$customerEmail",
          customerPhone: "$customerPhone",
          createdAt: "$createdAt",
          itemId: "$items._id",
          productId: "$items.productId",
          productName: "$items.name",
          quantity: "$items.quantity",
          price: "$items.price",
          itemStatus: "$items.status",
          sentAt: "$items.sentAt",
          manualReviewStatus: "$items.manualReviewStatus",
          manualReviewAt: "$items.manualReviewAt",
          payoutStatus: "$items.payoutStatus",
          receiptDetails: { $arrayElemAt: ["$items.receiptMatches", 0] }
        }
      }
    },
    {
      $group: {
        _id: "$vendorId",
        vendor: {
          $first: {
            _id: "$vendorId",
            name: "$vendorName",
            email: "$vendorEmail",
            phoneNumber: "$vendorPhoneNumber"
          }
        },
        orderItems: { $push: "$order" }
      }
    },
    { $sort: { "vendor.name": 1 } }
  ]);

  const vendorsDueForPayout = [];
  const vendorsForManualReview = [];

  for (const result of orderItems) {
    const dueOrders = result.orderItems.filter(
      (order) =>
        order.paymentStatus === "successful" &&
        order.itemStatus === "delivered" &&
        !["processing", "paid"].includes(order.payoutStatus)
    );
    const reviewOrders = result.orderItems.filter(
      (order) =>
        order.itemStatus === "in_transit" &&
        order.manualReviewStatus !== "declined" &&
        !order.receiptDetails
    );

    if (dueOrders.length) {
      vendorsDueForPayout.push({ ...result.vendor, orders: dueOrders });
    }
    if (reviewOrders.length) {
      vendorsForManualReview.push({ ...result.vendor, orders: reviewOrders });
    }
  }

  return { vendorsDueForPayout, vendorsForManualReview };
};

const loadPayoutDetails = async ({ vendorId, orderId, itemId, orderNumber }) => {
  if (![vendorId, orderId, itemId].every((id) => mongoose.Types.ObjectId.isValid(id))) {
    const error = new Error("Valid vendor, order, and item IDs are required");
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findOne({ _id: orderId, orderNumber });
  if (!order || order.paymentStatus !== "successful") {
    const error = new Error("Eligible paid order not found");
    error.statusCode = 404;
    throw error;
  }

  const item = order.items.id(itemId);
  if (!item || item.status !== "delivered") {
    const error = new Error("Order item is not eligible for payout");
    error.statusCode = 409;
    throw error;
  }
  if (["processing", "paid"].includes(item.payoutStatus)) {
    const error = new Error("Payout for this order item is already in progress or complete");
    error.statusCode = 409;
    throw error;
  }

  const product = await Product.findById(item.productId).select("vendorId");
  if (!product || product.vendorId.toString() !== vendorId) {
    const error = new Error("Order item does not belong to this vendor");
    error.statusCode = 403;
    throw error;
  }

  const receipt = order.customerOrderReceivedDetails.find(
    (detail) => detail.itemId?.toString() === item._id.toString()
  );
  const receivedQuantity = receipt?.receivedQuantity ??
    (item.manualReviewStatus === "approved" ? item.quantity : 0);
  const receivedAt = receipt?.receivedAt || item.manualReviewAt;
  if (!Number.isInteger(receivedQuantity) || receivedQuantity < 1 || !receivedAt) {
    const error = new Error("A confirmed receipt is required before payout");
    error.statusCode = 409;
    throw error;
  }
  if (Date.now() - new Date(receivedAt).getTime() < 24 * 60 * 60 * 1000) {
    const error = new Error("Payout is available 24 hours after receipt confirmation");
    error.statusCode = 409;
    throw error;
  }

  const vendor = await User.findById(product.vendorId)
    .select("_id fname lname email bankName accountNumber bankCode recipientCode subscriber subscriptionDetails");

   let paidAmount = 0;

  if (subscriber && subscriptionDetails?.plan === "standard") {
    paidAmount = Number(item.price) * receivedQuantity * 0.93;

  } else if (subscriber && subscriptionDetails?.plan === "premium") {
    paidAmount = Number(item.price) * receivedQuantity * 0.95;

  } else {
    // Basic subscribers and non-subscribers
    paidAmount = Number(item.price) * receivedQuantity * 0.90;
  }

  if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
    const error = new Error("Unable to calculate a valid payout amount");
    error.statusCode = 400;
    throw error;
  }
  console.log(order, item, vendor, paidAmount)

  return { order, item, vendor, paidAmount };
};

const markPayoutSuccessful = async (payment) => {
  const order = await Order.findById(payment.relatedOrderId);
  const item = order?.items.id(payment.orderItemId);
  if (!order || !item || item.payoutReference !== payment.reference) {
    const error = new Error("Payout transfer succeeded, but its order item could not be found");
    error.statusCode = 409;
    throw error;
  }

  payment.status = "successful";
  await payment.save();

  await Sales.findOneAndUpdate(
    { payoutReference: payment.reference },
    {
      $set: {
        orderId: order._id,
        orderItemId: item._id,
        vendorId: payment.vendorId,
        productId: item.productId,
        itemId: item.id,
        productName: item.name,
        customerId: order.customerId,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        quantity: Math.round(Number(payment.amount) / Number(item.price)),
        unitPrice: item.price,
        totalAmount: payment.amount,
        finalAmount: payment.amount,
        paymentMethod: "bank_transfer",
        paymentStatus: "completed",
        transactionId: payment.reference,
        status: "delivered",
        saleDate: payment.transferDate || new Date(),
        shippingAddress: order.shippingAddress
          ? {
              street: order.shippingAddress,
              city: order.city,
              state: order.state,
              country: "Nigeria",
            }
          : undefined,
        createdBy: payment.vendorId,
      },
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  const result = await Order.updateOne(
    {
      _id: payment.relatedOrderId,
      "items._id": payment.orderItemId,
      "items.payoutReference": payment.reference,
    },
    {
      $set: {
        "items.$.payoutStatus": "paid",
        "items.$.payoutPaidAt": new Date(),
      },
    }
  );
  if (!result.matchedCount) {
    const error = new Error("Payout transfer succeeded, but its order item could not be updated");
    error.statusCode = 409;
    throw error;
  }
};

export const initiateVendorPayout = async ({
  auth, adminAccessCode, vendorId, orderId, itemId, orderNumber,
}) => {
  const user = await User.findById(auth._id);
  validateAdmin(user);
  validateAdminAccessCode(adminAccessCode);
  const { order, item, vendor, paidAmount } = await loadPayoutDetails({
    vendorId, orderId, itemId, orderNumber,
  });
  console.log(vendor)
  if (!vendor.bankCode || !vendor.accountNumber) {
    const error = new Error("Vendor bank code and account number are required for payout");
    error.statusCode = 400;
    throw error;
  }

  await createTransferRecipient(vendor);
  const reference = `vendor-payout-${randomUUID()}`;
  const reservation = await Order.updateOne(
    {
      _id: order._id,
      paymentStatus: "successful",
      items: {
        $elemMatch: {
          _id: item._id,
          status: "delivered",
          payoutStatus: { $nin: ["processing", "paid"] },
        },
      },
    },
    {
      $set: {
        "items.$.payoutStatus": "processing",
        "items.$.payoutReference": reference,
      },
    }
  );
  if (!reservation.matchedCount) {
    const error = new Error("Payout for this order item is already in progress or complete");
    error.statusCode = 409;
    throw error;
  }

  const payment = new Payment({
    reference,
    acessCode: reference,
    purpose: "vendor_payout",
    amount: paidAmount,
    status: "pending",
    relatedOrderId: order._id,
    orderItemId: item._id,
    vendorId: vendor._id,
  });
  try {
    await payment.save();
  } catch (error) {
    await Order.updateOne(
      { _id: order._id, "items._id": item._id, "items.payoutReference": reference },
      { $set: { "items.$.payoutStatus": "failed" } }
    );
    throw error;
  }

  try {
    const transfer = await initiateTransfer({ vendor, paidAmount, reference });
    payment.transferCode = transfer.transferCode;
    payment.recipientCode = transfer.recipientCode || vendor.recipientCode;
    payment.transferDate = transfer.transferDate;
    if (transfer.status === "otp") {
      payment.status = "otp_required";
      await payment.save();
      return { paymentId: payment._id, reference, amount: paidAmount, requireOtp: true };
    }
    if (transfer.status === "success") {
      await markPayoutSuccessful(payment);
      return { paymentId: payment._id, reference, amount: paidAmount, status: "successful" };
    }
    await payment.save();
    return { paymentId: payment._id, reference, amount: paidAmount, status: "pending" };
  } catch (error) {
    if (error.response) {
      payment.status = "failed";
      await payment.save();
      await Order.updateOne(
        { _id: order._id, "items._id": item._id, "items.payoutReference": reference },
        { $set: { "items.$.payoutStatus": "failed" } }
      );
    }
    throw error;
  }
};

export const finalizeVendorPayout = async ({ auth, adminAccessCode, paymentId, otp }) => {
  const user = await User.findById(auth._id);
  validateAdmin(user);
  validateAdminAccessCode(adminAccessCode);
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    const error = new Error("Valid payout payment ID is required");
    error.statusCode = 400;
    throw error;
  }

  const payment = await Payment.findOne({ _id: paymentId, purpose: "vendor_payout" });
  if (!payment || !payment.transferCode) {
    const error = new Error("Payout transfer was not found or does not require finalization");
    error.statusCode = 404;
    throw error;
  }
  if (payment.status === "successful") {
    await markPayoutSuccessful(payment);
    return { reference: payment.reference, status: "successful" };
  }
  if (payment.status !== "otp_required") {
    const error = new Error("Payout transfer is not awaiting OTP finalization");
    error.statusCode = 409;
    throw error;
  }

  const transfer = await finalizeTransfer({ otp, transferCode: payment.transferCode });
  payment.transferDate = transfer.transferDate || payment.transferDate;
  if (transfer.status === "success") {
    await markPayoutSuccessful(payment);
    return { reference: payment.reference, status: "successful" };
  }

  payment.status = "pending";
  await payment.save();
  return { reference: payment.reference, status: "pending" };
};

export const reviewVendorPayout = async ({ auth, orderId, itemId, decision }) => {
  const user = await User.findById(auth._id);
  validateAdmin(user);

  if (!["approve", "decline"].includes(decision)) {
    const error = new Error("Decision must be approve or decline");
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  const item = order.items.id(itemId);
  if (!item) {
    const error = new Error("Order item not found");
    error.statusCode = 404;
    throw error;
  }

  const hasCustomerReceipt = (order.customerOrderReceivedDetails || []).some(
    (receipt) => receipt.itemId?.toString() === itemId
  );
  if (
    item.status !== "in_transit" ||
    item.manualReviewStatus === "declined" ||
    hasCustomerReceipt
  ) {
    const error = new Error("This order item is no longer awaiting manual review");
    error.statusCode = 409;
    throw error;
  }

  item.manualReviewStatus = decision === "approve" ? "approved" : "declined";
  if (decision === "approve") {
    item.status = "delivered";
    item.manualReviewAt = new Date();
    order.orderStatus = updateOrderStatusFromItems(order);
  }

  await order.save();
  return { decision, orderId: order._id, itemId: item._id };
};
export const fetchCustomerDetails = async(auth) => {
     const user = await User.findOne({_id: auth._id})
     const validate = validateAdmin(user)
     const customers = await User.find({role: "user"}).select("id fname lname username dob email phoneNumber joinedAt")
     return customers
}

export const fetchProducts = async(auth) => {
     const user = await User.findOne({_id: auth._id})
     const validate = validateAdmin(user)
     const products = await Product.find()
         .select("_id vendorId productName")
         .sort({_id: -1})
     return products
}

export const fetchOrders = async(auth) => {
     const user = await User.findOne({_id: auth._id})
     const validate = validateAdmin(user)
     const totalOrder = await Order.aggregate([
           {
             $project: {
               orderNumber: 1,
               amount: 1,
               currency: 1,
               paymentStatus: 1,
               customerName: 1,
               customerEmail: 1,
               customerPhone: 1,
               orderStatus: 1,
               createdAt: 1,
               items: 1,
               products: 1,
             },
           },
           {
             $group: {
               _id: "$orderStatus",
               count: { $sum: 1 },
               orders: { $push: "$$ROOT" },
             },
           },
           {
             $sort: { _id: 1 },
           },
         ])
     return totalOrder
}

export const fetchProductDetailsById = async({auth, req}) => {
     const user = await User.findOne({_id: auth._id})
     const validate = validateAdmin(user)
     const product = await Product.findOne({_id: req.params.id}).populate("vendorId", "fname lname username email")
     if (!product) {
      const  error = new Error("Product not found")
      error.statusCode = 404
     } 
     return product
}


export const fetchVendorDetailsById = async({auth, req}) => {
     const user = await User.findOne({_id: auth._id})
     const validate = validateAdmin(user)
     const vendor = await User.findOne({_id: req.params.id})
     if (!vendor) {
      const  error = new Error("vendor not found")
      error.statusCode = 404
     } 
     return vendor
}

export const saveVendorDocumentVerification = async ({
    auth,
    vendorId,
    proofOfAddressVerification,
    identificationVerification,
}) => {
    try {
        const admin = await User.findById(auth._id);
        validateAdmin(admin);

        const validStatuses = ["verified", "rejected"];

        if (
            !validStatuses.includes(proofOfAddressVerification) ||
            !validStatuses.includes(identificationVerification)
        ) {
            const error = new Error(
                "Choose verified or rejected for both documents"
            );
            error.statusCode = 400;
            throw error;
        }

        const vendor = await User.findOne({
            _id: vendorId,
            role: "vendor"
        });

        if (!vendor) {
            const error = new Error("Vendor not found");
            error.statusCode = 404;
            throw error;
        }

        // Update individual document verification statuses
        vendor.proofOfAddressVerification = proofOfAddressVerification;
        vendor.identificationVerification = identificationVerification;

        // Determine the overall vendor status
        const bothVerified =
            proofOfAddressVerification === "verified" &&
            identificationVerification === "verified";

        vendor.status = bothVerified ? "approved" : "rejected";

        await vendor.save();

        // Send approval email
        if (bothVerified) {
            await sendApprovalEmail({
                email: vendor.email,
                firstName: vendor.fname
            });
        } else {
            // Identify the documents that were rejected
            const rejectedFields = [];

            if (proofOfAddressVerification === "rejected") {
                rejectedFields.push("proof of address");
            }

            if (identificationVerification === "rejected") {
                rejectedFields.push("means of identification");
            }

            const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "");
            const updateUrl = `${frontendUrl}/vendor/update-verification/${vendor._id}`;

            await sendRejectionEmail({
                email: vendor.email,
                firstName: vendor.fname,
                updateUrl,
                rejectedFields: rejectedFields.join(" and ")
            });
        }

        return vendor;

    } catch (error) {
        throw new Error("unable to verify document")
    }
};
 
export const fetchCustomerDetailsById = async({auth, req}) => {
     const user = await User.findOne({_id: auth._id})
     validateAdmin(user)
     const customer = await User.findOne({_id: req.params.id})
     if (!customer) {
      const  error = new Error("customer not found")
      error.statusCode = 404
     } 
     return customer
}
export const fetchDataAnalytics = async(auth) => {
     const user = await User.findOne({_id: auth._id});
     validateAdmin(user);
     const totalUsers = await User.countDocuments();
       const totalSales = await Sales.countDocuments();
       const totalOrders = await Order.countDocuments();
       const totalProducts = await Product.countDocuments();
       const pendingApprovals = await User.countDocuments({role: "vendor", status: "pending"})
       const pendingOrders = await Order.countDocuments({orderStatus: "pending"})
       const deliveredOrders = await Order.countDocuments({orderStatus: "delivered"})
       const topBuyer = await User.aggregate([
       {
         $match: { role: "user" }
       },
     
       {
         $lookup: {
           from: "orders",
           localField: "_id",
           foreignField: "customerId",
           as: "productOrdered"
         }
       },
     
       {
       $unwind: {
         path: "$productOrdered",
         preserveNullAndEmptyArrays: true
       }
     },
     
       {
         $group: {
           _id: "$_id",
           name: {
                 $first: {
                 $concat: ["$fname", " ", "$lname"]
                 }
              },
           totalPurchases: { $sum: "$productOrdered.amount" }
         }
       },
     
       {
         $sort: { totalPurchases: -1 }
       },
     
       {
         $limit: 1
       }
     ]);
     
       const topSeller = await User.aggregate([
         {
           $match : { role: "vendor" } 
         },
         {
           $lookup : {
             from: "products",
             localField: "_id",
             foreignField: "vendorId",
             as: "vendorProducts"
           }
         },
          {
         $unwind: {
           path: "$vendorProducts",
           preserveNullAndEmptyArrays: true
           }
         },
     
           {
             $lookup : {
               from: "sales",
               localField: "vendorProducts._id",
               foreignField: "productId",
               as: "productSales"
             }
           },
     
           {
             $group: {
               _id: "$_id",
               name: {
                 $first: {
                 $concat: ["$fname", " ", "$lname"]
                 }
              },
               totalSales: { $sum: { $size: "$productSales" } }
             }
           },
     
           {
             $sort: { totalSales: -1 }
           },
     
           {
             $limit: 1
           }
           
       ])

           return { totalUsers, totalSales, totalOrders, totalProducts, topSeller, topBuyer, pendingApprovals, pendingOrders, deliveredOrders }
}

export const fetchVendorsDueForPayout = async (auth) => {
    const user = await User.findById(auth._id);
    validateAdmin(user);
    return getVendorOrderPayouts();
};