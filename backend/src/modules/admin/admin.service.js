import User from "../../models/User.js"
import Product from "../../models/Product.js"
import Sales from "../../models/Sales.js"
import Order from "../../models/Order.js"
import { validateAdmin, validateAdminAccessCode } from "./admin.validation.js"
import bcrypt from "bcryptjs";
import {generateToken} from "../../utils/generateToken.js"
import { sendApprovalEmail, sendRejectionEmail } from "../../integrations/email/email.service.js";
import { updateOrderStatusFromItems } from "../../utils/updateOrderStatus.js";




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
        order.itemStatus === "delivered"
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

export const fetchVendorsPayoutDetails = async ({ auth, adminAccessCode }) => {
  const user = await User.findById(auth._id);
  validateAdmin(user);
  validateAdminAccessCode(adminAccessCode);
  return getVendorOrderPayouts();
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