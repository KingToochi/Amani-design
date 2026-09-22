import Comments from "../../models/Comment.js";
import Product from "../../models/Product.js";
import Rating from "../../models/Rating.js";

const getReviewsForProduct = async (productId) => {
    const [reviews, ratingSummary] = await Promise.all([
        Comments.find({
            targetType: "product",
            targetId: productId,
            parentCommentId: null,
            status: "approved",
        })
            .populate("authorId", "fname lname username profilePicture")
            .sort({ createdAt: -1 }),
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

    return {
        reviews,
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

        const reviewFilter = {
            targetType: "product",
            targetId: product._id,
            authorId: req.user._id,
            parentCommentId: null,
        };
        const review = reviewContent
            ? await Comments.findOneAndUpdate(
                reviewFilter,
                {
                    content: reviewContent,
                    ...(numericRating !== null ? { rating: numericRating } : {}),
                    status: "approved",
                },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            )
            : await Comments.findOneAndUpdate(
                reviewFilter,
                { ...(numericRating !== null ? { rating: numericRating } : {}) },
                { new: true }
            );

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
