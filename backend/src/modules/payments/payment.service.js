import { validateCustomer } from "../customer/customer.validation.js"
import User from "../../models/User.js"
import verifyPaystackPayment from "../../integrations/paystack/verify.js"
import calculateAmount from "../../utils/calculateAmount.js"
import { verifyPaymentStatus } from "./payment.validation.js"

export const paymentVerification = async({auth, reference, cart}) => {
    const user = await User.findById(auth._id)
    const validate = validateCustomer(user)
    const verifiedPayment = await verifyPaystackPayment(reference);
    const calculatedAmount = await calculateAmount(cart)
    const verify = verifyPaymentStatus(verifiedPayment)

    const calculatedAmountInKobo = Math.round(Number(calculatedAmount) * 100);
            console.log(calculatedAmountInKobo)
            console.log(verifiedPayment.requested_amount)
    
            if ( Number(calculatedAmountInKobo) !== Number(verifiedPayment.requested_amount)) {
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
              transactionId : verifiedPayment.id,
              amount : Number(verifiedPayment.requested_amount) / 100,
              subtotalAmount : Number(verifiedPayment.requested_amount) / 100,
              paymentFee : Number(verifiedPayment.fees) / 100,
              amountPaid : Number(verifiedPayment.amount) / 100,
              paymentStatus : "successful",
              paymentReference : verifiedPayment.reference,
              customerEmail : user.email,
              customerId : user._id,
              customerPaymentId : verifiedPayment.customer.id,
              customerName: `${user.fname} ${user.lname}`,
              customerPhone : user.phoneNumber,
              items : cartItems,
            })
    
            await newOrder.save()
        return newOrder
}  