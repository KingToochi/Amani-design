import Product from "../../models/Product.js";
import Rating from "../../models/Rating.js";
import Review from "../../models/Review.js";

const getReviewsForProduct = async (productId) => {
    const [reviews, ratings, ratingSummary] = await Promise.all([
        Review.find({
            productId,
            status: "approved",
        })
            .populate("userId", "fname lname username profilePicture")
            .sort({ createdAt: -1 }),
        Rating.find({ productId }).select("userId value"),
        Rating.aggregate([
            { $match: { productId } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$value" },
                    totalRatings: { $sum: 1 },
                },
            },
        ]),
    ]);

    const ratingsByUser = new Map(
        ratings.map((rating) => [String(rating.userId), rating.value])
    );
    const reviewsWithRatings = reviews.map((review) => ({
        ...review.toObject(),
        rating: ratingsByUser.get(String(review.userId?._id)),
    }));

    return {
        reviews: reviewsWithRatings,
        averageRating: ratingSummary[0]?.averageRating || 0,
        totalRatings: ratingSummary[0]?.totalRatings || 0,
        totalReviews: reviews.length,
    };
};

export const getProductReviews = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId).select("_id");
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.json({ success: true, ...(await getReviewsForProduct(product._id)) });
    } catch (error) {
        next(error);
    }
};

export const saveProductReview = async (req, res, next) => {
    try {
        const { content, rating } = req.body;
        if(rating === 0) {
            throw new Error("no rating")
        }
        const product = await Product.findById(req.params.productId).select("_id");
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const reviewContent = typeof content === "string" ? content.trim() : "";
        const numericRating = rating === undefined || rating === null || rating === ""
            ? null
            : Number(rating);

        if (!reviewContent && numericRating === null) {
            return res.status(400).json({ success: false, message: "Add a review or rating before submitting" });
        }

        if (numericRating !== null && (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5)) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const review = reviewContent
            ? await Review.findOneAndUpdate(
                { productId: product._id, userId: req.user._id },
                { content: reviewContent, status: "approved" },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            )
            : null;

        if (numericRating !== null) {
            await Rating.findOneAndUpdate(
                { productId: product._id, userId: req.user._id },
                { value: numericRating },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Review saved successfully",
            review,
            ...(await getReviewsForProduct(product._id)),
        });
    } catch (error) {
        next(error);
    }
};
