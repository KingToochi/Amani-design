import { Link } from "react-router-dom";
const Page404 = () => {
    return ( 
        <div>
            <h1>404- Page Not Found</h1>
            <p>The page you are looking for does not exist</p>
            <p>Please check the URl of return to the home page</p>
            <div>
                <Link to="/">Go to home</Link>
                <Link to="/login">Login</Link>
            </div>
        </div>
        
     );
}
 
export default Page404;