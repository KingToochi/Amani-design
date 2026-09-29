import { useEffect, useState } from "react"
import CustomFetch from "../../hooks/useFetch"
import { BASE_URL } from "../../Url"
import Popup from "../../components/common/Popup"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

const ResetPassword = () => {
    const [loading, setLoading] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [searchParams] = useSearchParams()
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [issubmiting, setIsSubmiting] = useState(false)
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword : ""
    })
    const [error, setError] = useState({})
    const [passwordStrength, setPasswordStrength] = useState("")
    const url = `${BASE_URL}/users/reset-password`
    const verifyUrl = `${BASE_URL}/users/verify-reset-link`
    const token = searchParams.get("token")
    const navigate = useNavigate()

    const verifyLink = async() => {
            try {
                
                if (!token) {
                    Popup({
                        message : "invalid reset link",
                        type : "error"
                    })
                    navigate("/login")
                    return
                }
                const verify = await fetch(verifyUrl, {
                    method : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body : JSON.stringify({token})
                })
                const response = await verify.json()

                if (!verify.ok) {
                    Popup({
                        message : response.message || "Invalid or expired reset link",
                        type : "error"
                    })
                    navigate("/login")
                    return
                }

                setLoading(false)
                }catch(error) {
                    console.log(error)
                    Popup({
                        message: "Unable to verify reset link",
                        type: "error"
                    });

                    navigate("/login");
                }  
        }
    useEffect(()=> {
        verifyLink()
    }, [])

    const validateData = (event) => {
        const {id, value, name} = event.target

        setFormData(prev => ({
            ...prev,
            [id] : value
        }))

        setError(prev => {
            const newError = {...prev}
            delete newError[id]
            return newError
        })

        if (id === "password") {
            let strength = 0;
            if (value.length >= 8) strength++;
            if (/[A-Z]/.test(value)) strength++;
            if (/[a-z]/.test(value)) strength++;
            if (/\d/.test(value)) strength++;
            if (/[^A-Za-z0-9]/.test(value)) strength++;

            const level =
            strength <= 2 ? "weak" :
            strength <= 4 ? "moderate" :
            "strong";

            setPasswordStrength(level);
        }

        // Confirm password check
        if (id === "confirmPassword") {
            if (value !== formData.password) {
            setError(prev => ({
                ...prev,
                confirmPassword: "Passwords do not match"
            }));
        } else {
        setError(prev => {
            const newErr = { ...prev };
            delete newErr.confirmPassword;
            return newErr;
            });
        }
        }
    }

    const validateForm = () => {
        const newError = {}

        if (!formData.password.trim()){
            newError.password = "password is required"
        }

        if (!formData.confirmPassword.trim()) {
            newError.confirmPassword = "confirm Password is required"
        }

        if (formData.confirmPassword !== formData.password) {
            newError.confirmPassword = "password do not match"
        }

        if (formData.password.length < 8) {
            newError.password = "password must be atleast 8 characters"
        }

        setError(newError)
        return Object.keys(newError).length === 0;
    }

    const handleSubmit = async(event) => {
        event.preventDefault()
        if(!validateForm()){
            return
        }
    
        try {
            
            setIsSubmiting(true)
            const resetPassword = fetch(url, 
                {
                    method : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body : JSON.stringify({
                        token,
                        password : formData.password
                    })
                }
            )
            const response = await resetPassword.json()
            if (!resetPassword.ok) {

                throw new Error(
                    response.message ||
                    "Unable to reset password"
                );

            }

            Popup({
                message: "Password reset successfully",
                type: "success"
            });


            navigate("/login");

        }catch(error) {
            console.error(error);

            Popup({
                message: error.message,
                type: "error"
            });
        } finally {
            setIsSubmiting(false)
        }
    }

    if (loading) {
        return(
            <h1>verifing link</h1>
        )
    }

    return(
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <div>
                        <label>new password</label>
                        <input type={showPassword ? "text" : "password"}  name="password" id="password" value={formData.password} placeholder = "enter new password" onChange={validateData}/>
                        <h1>{passwordStrength}</h1>
                        {error.password && <h1>{error.password}</h1>}
                    </div>
                    <button type="button" onClick={()=>setShowPassword(prev => !prev)}>
                        {showPassword ? <FaEyeSlash/> : <FaEye/>}
                    </button>
                </div>

                <div>
                    <div>
                        <label>confirm password</label>
                        <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword"  name="confirmPassword" value={formData.confirmPassword} onChange={validateData} placeholder = "confirm password"/>
                         {error.confirmPassword && <h1>{error.confirmPassword}</h1>}
                    </div>
                    <button type="button" onClick={()=>setShowConfirmPassword(prev => !prev)}>
                        {showConfirmPassword ? <FaEyeSlash/> : <FaEye/>}
                    </button>
                </div>

                <button type="submit">{issubmiting ? "submitting" : "submit"}</button>
            </form>
        </div>
    )

}

export default ResetPassword