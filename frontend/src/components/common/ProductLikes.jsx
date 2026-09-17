const ProductLikes = (likes) => {
    return likes.map((like) => {

        let displayLikes;

        if (like.likes >= 1000) {
            displayLikes = "1k+";
        } else if (like.likes >= 20) {
            displayLikes = `${Math.floor(like.likes / 10) * 10}+`;
        } else {
            displayLikes = like.likes;
        }

        return {
            ...like,
            displayLikes
        };
    });
};

export default ProductLikes;