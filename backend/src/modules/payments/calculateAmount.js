import Product from "../../models/Product.js";

const calculateAmount = async (cart) => {
    let subTotal = 0;

    for (const cartProduct of cart) {

        // Find product in database
        const productDetails = await Product.findById(cartProduct._id);

        if (!productDetails) {
            throw new Error(
                `Product ${cartProduct._id} not found`
            );
        }

        // Validate quantity
        const quantity = Number(cartProduct.quantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error(
                `Invalid quantity for ${productDetails.productName}`
            );
        }

        let price;

        // Product has variants
        if (productDetails.hasVariants) {

            // First check whether itemId is a variant ID
            const variant = productDetails.variants.find(
                (variant) =>
                    variant._id.toString() ===
                    cartProduct.itemId.toString()
            );

            if (variant) {

                // itemId is a variant ID
                price = Number(variant.price);

            } else if (
                productDetails._id.toString() ===
                cartProduct.itemId.toString()
            ) {

                // itemId is actually the product ID
                price = Number(productDetails.basePrice);

            } else {

                throw new Error(
                    `Selected variant not found for ${productDetails.productName}`
                );
            }

        } else {

            // Product does not have variants
            price = Number(productDetails.basePrice);
        }

        const subAmount = price * quantity;

        subTotal += subAmount;
    }

    return Number(subTotal.toFixed(2));
};

export default calculateAmount;