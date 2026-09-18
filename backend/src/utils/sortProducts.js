import User from "../models/User.js"

export const sortProducts = async(products) => {
    const statusScore = {
        active : 100,
        trial : 80,
        past_due : 20,
        canceled : 10,
        inactive : 0
    }

    const planScore = {
        premium : 100,
        standard : 60,
        basic : 20,
        none : 0,
    }

    const vendorIds = [
        ...new Set(
            products.map(product => product.vendorId)
        )
    ]
    const vendors = await User.find({_id : {$in : vendorIds}}).select("subscriptionDetails subscriber").lean()
    const vendorMap = new Map(
        vendors.map((vendor)  =>[ 
            vendor._id.toString(),
            vendor
        ])
    )

    const productsWithScore = products.map((product) => {
        const vendor = product.vendorId
        ? vendorMap.get(product.vendorId.toString())
        : null;

        if (!vendor || !vendor.subscriber) {
            return {
                ...product,
                vendorScore : 0
            }
        }

        const status = vendor.subscriptionDetails?.status || "inactive";

        const plan = vendor.subscriptionDetails?.plan || "none";

        const vendorScore = (statusScore[status] || 0) + (planScore[plan] || 0);

        return {
            ...product,
            vendorScore,
        }

    })

    const sortedProducts = productsWithScore.sort((a,b) => b.vendorScore - a.vendorScore)

    return sortedProducts



}