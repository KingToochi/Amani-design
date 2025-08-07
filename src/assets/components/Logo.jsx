// this component takes a logo image from the image folder 
// and return a container with company logo and name

import logo from "../images/mainLogo.jpg"

const Logo = ({className, ImageClassName, textClassName}) => {
    return (  
        <div 
        className={className}
        >
            <img
            className={ImageClassName}
            src={logo} 
            alt="Amani Design Logo" 
            />
            <h1 className={textClassName}
        
            >
                AmaniSky <br/>Design
            </h1>
        </div>
    );
}
 
export default Logo;