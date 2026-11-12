import { useState, useEffect } from "react";
import OptimizedImage from "./OptimizeImage";

const EMPTY_IMAGE_ARRAY = [];

const Slide = ({
    imageArray = EMPTY_IMAGE_ARRAY,
    alt,
    className = "w-full h-full object-cover rounded-lg",
    priority = false
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const images = Array.isArray(imageArray) ? imageArray : EMPTY_IMAGE_ARRAY;

    useEffect(() => {

        if (!isActive || images.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 1000);

        return () => clearInterval(interval); // cleanup
    }, [isActive, images.length]);

    if (images.length === 0) return null;

    return (
        <div 
            onMouseEnter={() => setIsActive(true)}
            onMouseLeave={() => setIsActive(false)}
            onTouchStart={() => setIsActive(true)}
            onTouchEnd={() => setIsActive(false)}>
            <OptimizedImage
                src={images[currentIndex]}
                alt={alt}
                className={className}
                priority={priority}
            />
        </div>
    );
};

export default Slide;