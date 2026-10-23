import { validateCustomer } from "../customer/customer.validation.js"
import User from "../../models/User.js"
import verifyPaystackPayment from "../../integrations/paystack/verify.js"
import calculateAmount from "../../utils/calculateAmount.js"
import { verifyPaymentStatus } from "./payment.validation.js"
import Order from "../../models/Order.js"
import createVendorOrderNotifications from "../notification/notice.js"
import Payment from "../../models/Payment.js"


export const paymentVerification = async({auth, reference, cart}) => {
    const user = await User.findById(auth._id)
    validateCustomer(user)
    const verifiedPayment = await verifyPaystackPayment(reference);
    const calculatedAmount = await calculateAmount(cart)
    verifyPaymentStatus(verifiedPayment)
    const payment = verifiedPayment.payment
    const paymentModel = verifiedPayment.paymentModel
    if (paymentModel) {
      paymentModel.status = "successful"
      await paymentModel.save()
    }

    const calculatedAmountInKobo = Math.round(Number(calculatedAmount) * 100);
            console.log(calculatedAmountInKobo)
            console.log(payment.requested_amount)
    
            if ( Number(calculatedAmountInKobo) !== Number(payment.requested_amount)) {
                const error = new Error("Amount paid not equal to total amount")
                error.statusCode = 400
                throw error
            }
    
      
    
            const products = cart.map(product => ({
              productId: product._id,
              quantity: product.quantity
            }));
            const cartItems = cart.map(product => ({
              id: product.itemId,
              name: product.productName,
              quantity: product.quantity,
              color: product.selectedColor,
              size: product.selectedSize,
              price: product.productPrice,
              productId: product._id,
            }))
    
            const newOrder = new Order({
              orderNumber : `Amanisky-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
              products : products,
              transactionId : payment.id,
              amount : Number(payment.requested_amount) / 100,
              subtotalAmount : Number(payment.requested_amount) / 100,
              paymentFee : Number(payment.fees) / 100,
              amountPaid : Number(payment.amount) / 100,
              paymentStatus : "successful",
              paymentReference : payment.reference,
              customerEmail : user.email,
              customerId : user._id,
              customerPaymentId : payment.customer.id,
              customerName: `${user.fname} ${user.lname}`,
              customerPhone : user.phoneNumber,
              items : cartItems,
              deliveryCompany : user.deliveryCompany,
              shippingAddress : user.shippingAddress,
              city : user.city,
              state : user.state
            })

            console.log("cart", cartItems)
            console.log("newOrder", newOrder)
    
            await newOrder.save()
            await createVendorOrderNotifications(newOrder)
        return newOrder
}  