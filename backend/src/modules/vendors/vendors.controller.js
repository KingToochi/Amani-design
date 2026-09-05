import { confirmItemAvailability, fetchProductAnalytics, fetchVendorProduct, fetchVendorProductById } from "./vendors.service.js"
import Sales from "../../models/sales.model.js"
import Orders from "../../models/order.model.js"
import Comments from "../../models/comments.model.js"
import Rating from "../../models/rating.model.js"
export const getProductAnalytics =  async(req, res, next) => {
    try{
            const auth = req.user
    const products = await fetchProductAnalytics(auth)

    const productIds = products.map(item => item._id);
    
        if (productIds.length === 0) {
          return res.json({
            success: true,
            sales: {
              totalSales: 0,
              totalRevenue: 0
            },
            orders: {
              totalOrders: 0
            },
            comments: {
              totalComments: 0
            },
            ratings: {
              totalRatings: 0,
              averageRating: 0
            }
          });
        }
    
        const [
          salesData,
          ordersData,
          commentsData,
          ratingsData
        ] = await Promise.all([
    
          // SALES
          Sales.aggregate([
            {
              $match: {
                productId: { $in: productIds }
              }
            },
            {
              $group: {
                _id: null,
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$amount" }
              }
            }
          ]),
    
          // ORDERS
          Orders.aggregate([
            {
              $match: {
                "products.productId": { $in: productIds }
              }
            },
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 }
              }
            }
          ]),
    
          // COMMENTS
          Comments.aggregate([
            {
              $match: {
                targetId: { $in: productIds }
              }
            },
            {
              $group: {
                _id: null,
                totalComments: { $sum: 1 }
              }
            }
          ]),
    
          // RATINGS
          Rating.aggregate([
            {
              $match: {
                productId: { $in: productIds }
              }
            },
            {
              $group: {
                _id: null,
                totalRatings: { $sum: 1 },
                averageRating: { $avg: "$rating" }
              }
            }
          ])
        ]);
    
        res.json({
          success: true,
    
          sales: salesData[0] || {
            totalSales: 0,
            totalRevenue: 0
          },
    
          orders: ordersData[0] || {
            totalOrders: 0
          },
    
          comments: commentsData[0] || {
            totalComments: 0
          },
    
          ratings: ratingsData[0] || {
            totalRatings: 0,
            averageRating: 0
          }
        });
    }catch(error){
        next(error)
    }
}

export const getVendorSales = async(req, res, next) => {
    try {
        const auth = req.user
        const products = await fetchVendorProduct(auth)
        const productIds = products.map((items) => items._id)
            let  totalSales;
        
            if (productIds.length === 0) {
                return res.json({
                  success: true,
                  message: "No products found for this vendor",
                  totalSales: [],
                });
              }
        
            // get the list of orders of each product
            totalSales = await Sales.aggregate([
              {
                $match :{ 
                  productId : {$in : productIds}}
              },
        
              {
                $project :{
                  productId :1,
                  productName: 1,
                  quantity: 1,
                  totalAmount: 1,
                  tax: 1,
                  finalAmount: 1,
                  createdAt: 1,
                  currency: 1,
                }
              },
        
              {
                $sort: { createdAt: -1 }
              },
              {
                $group: {
                  _id: "$productId",
                  totalSales: { $sum: "$quantity" },
                  totalRevenue: { $sum: "$finalAmount" },
                }
              }
            ])
        
            return res.json({
                success: true,
                totalSales
              });
    }catch(error) {
        next(error)
    }
}

export const getVendorOrders = async(req, res, next) => {
    try {
        const auth = req.user
        const products = await fetchVendorProduct(auth)
            // get the product Id
            const productIds = products.map((item) => item._id.toString());
            let totalOrder;
        
            if (productIds.length === 0) {
                return res.json({
                  success: true,
                  message: "No products found for this vendor",
                  totalOrder: [],
                });
              }
        
            // get the list of orders of each product
            totalOrder = await Order.aggregate([
              {
                $match: {
                  $or: [
                    { "products.productId": { $in: productIds } },
                    { "items.productId": { $in: productIds } },
                  ],
                },
              },
        
              {
                $project: {
                  products: {
                    $filter: {
                      input: "$products",
                      as: "product",
                      cond: {
                        $in: ["$$product.productId", productIds],
                      },
                    },
                  },
                  amount: 1,
                  orderStatus: 1,
                  createdAt: 1,
                  paymentStatus: 1,
                  currency: 1,
                  items: {
                    $filter: {
                      input: "$items",
                      as: "item",
                      cond: {
                        $in: ["$$item.productId", productIds],
                      },
                    },
                  },
                },
              },
        
              {
            $group: {
              _id: "$orderStatus",
              count: { $sum: 1 },
              orders: { $push: "$$ROOT" }
            }
          }
            ])
        
            return res.json({
                success: true,
                totalOrder
              });
    }catch(error) {
        next(error)
    }
}

export const getOrderDetailsById = async(req, res, next) => {
    try {
        const auth = req.user
        const orderId = req.params.id;
        const products = await fetchVendorProductById(auth)
        const productIds = products.map(item => item._id);
        
            const order = await Order.findById(orderId);
        
            if (!order) {
              return res.status(404).json({
                success: false,
                message: "Order not found"
              });
            }
        
            const vendorItems = (order.items || []).filter(item => {
              const itemProductId = item?.productId?.toString?.();
              return productIds.some((id) => id.toString() === itemProductId);
            });
        
            if (vendorItems.length === 0) {
              return res.status(403).json({
                success: false,
                message: "This order does not contain your products"
              });
            }
        
        
            const vendorItemId = vendorItems.map(item => item.productId)
            const vendorItemImage = await Product.find(
              {_id : {$in : vendorItemId}}
            ).select("_id productImages")
            const amount = order.amount
            const customerDetails = await User.findById(order.customerId).select("fname lname phoneNumber shippingAddress city state")
            const customerName = [customerDetails?.fname, customerDetails?.lname].filter(Boolean).join(" ") || order.customerName || "N/A"
        
            const vendorOrder = {
              _id: order._id,
              orderNumber: order.orderNumber,
              orderStatus: order.orderStatus,
              currency: order.currency,
              amount,
              createdAt: order.createdAt,
              paymentStatus: order.paymentStatus,
              customerName,
              customerPhone: customerDetails?.phoneNumber || order.customerPhone || "N/A",
              shippingAddress: customerDetails?.shippingAddress || "No shipping address provided",
              item: vendorItems,
              image: vendorItemImage,
              customerDetails,
            }
        
            return res.json({
              success: true,
              vendorOrder,
            });
    }catch(error) {
        next(error)
    }
}

export const confirmItem = async(req, res, next) => {
  try{
    const auth = req.user;
    const { orderId, items = [] } = req.body;

    const order = await confirmItemAvailability({auth, orderId, items})
    return res.json({
      success: true,
      message: "Item availability confirmations saved",
      order
    });

  }catch(error){
    next(error)
  }
}