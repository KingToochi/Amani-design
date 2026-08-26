import { useState, useEffect } from "react";

const Slide = ({ imageArray, alt, className = "w-full h-full object-cover rounded-lg" }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {

        if (!isActive || imageArray.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % imageArray.length);
        }, 1000);

        return () => clearInterval(interval); // cleanup
    }, [isActive, imageArray.length]);

    return (
        <div 
            onMouseEnter={() => setIsActive(true)}
            onMouseLeave={() => setIsActive(false)}
            onTouchStart={() => setIsActive(true)}
            onTouchEnd={() => setIsActive(false)}>
            <img
                src={imageArray[currentIndex]}
                alt={alt}
                className={className}
                
            />
        </div>
    );
};

export default Slide;