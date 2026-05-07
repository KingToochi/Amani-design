import { useState, useEffect } from "react";

const Slide = ({ imageArray, alt }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % imageArray.length);
        }, 3000);

        return () => clearInterval(interval); // cleanup
    }, [imageArray.length]);

    return (
        <div className="w-full h-64 relative overflow-hidden">
            <img
                src={imageArray[currentIndex]}
                alt={alt}
                className="w-full h-full object-cover rounded-lg"
            />
        </div>
    );
};

export default Slide;