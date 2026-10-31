import { v2 as cloudinary } from "cloudinary";

export const deleteImageFromCloudinary = async (imageUrl) => {
    try {
        const publicId = []
        imageUrl.forEach((url) => {
            const urlObj = new URL(url);
            const publicIdValue = urlObj.pathname
                .split("/upload/")[1]
                .replace(/^v\d+\//, "")
                .replace(/\.[^/.]+$/, "");
            publicId.push(publicIdValue)
        })
        await Promise.all(publicId.map((id) => cloudinary.uploader.destroy(id)));
    }catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        throw new Error("Failed to delete image from Cloudinary");
    }
};

