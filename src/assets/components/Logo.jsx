// this component takes a logo image from the image folder 
// and return a container with company logo and name

import logo from "../images/mainLogo.jpg"

const Logo = () => {
    return (  
        <div 
        className="flex gap-2 items-center"
        >
            <img
            className="w-[50px] h-[50px] rounded-[50%]" 
            src={logo} 
            alt="Amani Design Logo" 
            />
            <h1 className="text-xl font-[roboto] font-bold text-center"
            >
                AmaniSky <br/>Design
            </h1>
        </div>
    );
}
 
export default Logo;