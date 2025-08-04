import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
const BottomNav = () => {
    return ( 
        /*this component returns a category nav list */
        <ul className="flex justify-center gap-4 text-[4vw] font-semibold mb-4 font-[serif]
        md:text-[3vw] md:gap-10
        lg:text-[2vw] lg:gap-12">
            <li>
                <Link to="/">Men's </Link>
            </li>

            <li>
                <Link to="/">Women's</Link>
            </li>

            <li>
                <Link to="/">Kid's </Link>
            </li>
             <li>
                <Link to="/">Footwear </Link>
            </li>
            <li>
                <Link to="/">Accesories</Link>
            </li>
        </ul>
     );
}
 
export default BottomNav;