import { Link } from "react-router-dom";

const Unauthorized = () => {
    return ( 
        <div>
            <h1>Unauthorized Access</h1>
            <p>You do not have permision for this page</p>
            <p>Pleasre contact the administrator for access</p>
            <div>
                <Link to="/">Go to home</Link>
                <Link to="/login">Login</Link>
            </div> 
        </div>
    );
}
 
export default Unauthorized;