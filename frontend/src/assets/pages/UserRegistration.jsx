import { useState, useEffect } from "react"
import { BASE_URL } from "../Url"
import logo from "../images/mainLogo.jpg"
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
const UserRegistration = () => {
    const url = BASE_URL
    const [showPassword, setShowPassword] = useState(false)
    const [showCPassword, setShowCPassword] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(" ")
    const [error, setError] = useState({
        
    })
    const [formData, setFormData] = useState({
        fname: "",
        lname: "",
        username: "",
        email: "",
        status: "",
        password: "",
    })

    const validateEmail = (e) => {
        const {id, value} = e.target
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
            setError({...error, [id] : "invalid email"})
        }else {
            const newError = {...error}
            delete newError[id]
            setError(newError)
        }
    }

    const checkPasswordStrength = (value) => {
        let strength = 0
        if (value.length >= 8 ) strength++
        if (/[A-Z]/.test(value)) strength++
        if (/[a-z]/.test(value)) strength++
        if (/\d/.test(value)) strength++
        if (/[^A-Za-z0-9]/.test(value)) strength++;
        if (strength <= 2) return "weak"
        if (strength <= 4) return "moderate"
        if (strength === 5) return "strong"

        return " "
    }

    const confirmPassword = (event) => {
        const {id, value} = event.target
        if (value !== formData.password) {
            setError({...error, [id] : "passwords do not match"})
        }else {
            const newError = {...error}
            delete newError[id]
            setError(newError)
        } 
    }

    const handlePasswordChange = (e) => {
        const {id, value} = e.target
        setPasswordStrength(checkPasswordStrength(value))
    }

    const handleChange = (e) => {
        const {id, value} = e.target
        setFormData({...formData, [id] : value})
    }

    const handleEmptyField = (e) => {
        const {id, value} = e.target
        if (value.length === 0) {
            setError({...error, [id]: "empty field"})
        }
        else {
            const newError = {...error}
            delete newError[id]
            setError(newError)
        }
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        if (Object.keys(error).length === 0) {
            try {
                let response = await fetch(`${url}/user`, {
                    method: "POST",
                    body : JSON.stringify(formData)
                })
                let data = response.json()
                console.log(data)
            } catch(error){

                         }
        }else {
            console.log("Form has errors:", error);
        }
    }

    return(
        <div 
        className="w-full flex flex-col px-4 py-4 min-h-screen font-[abril] text-lg gap-4
        sm:text-xl
        md:text-2xl
        "
        >
            <div
            className="w-full flex flex-col items-center"
            >
                <img src={logo} alt="amanisky" 
                className="w-[50px] rounded-full"
                />
                <h1
                className="font-semibold"
                >AmaniSky</h1>
            </div>
            <form onSubmit={handleSubmit}
            className="w-[98%] flex flex-col gap-4"
            >
            <div
            className="flex flex-col w-full"
            >
                <label htmlFor="fname">First Name</label>
                <input type="text" id="fname" value={formData.fname} placeholder="first name" onChange={handleChange} onBlur={handleEmptyField}
                className="w-full border-1 border-gray-700 rounded-lg px-2 focus:outline-none"
                />
                <h1>{error.fname}</h1>
            </div>
            
            <div
            className="flex flex-col w-full"
            >
                <label htmlFor="lname">Last Name</label>
                <input type="text" id="lname" value={formData.lname} placeholder="last name" onChange={handleChange} onBlur={handleEmptyField}
                className="w-full border-1 border-gray-700 rounded-lg px-2 focus:outline-none"
                />
                <h1>{error.lname}</h1>
            </div>

            <div
            
            className="flex flex-col w-full">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" value={formData.username} placeholder="username" onChange={handleChange} onBlur={handleEmptyField}
                className="w-full border-1 border-gray-700 rounded-lg px-2 focus:outline-none"
                />
                <h1>{error.username}</h1>
            </div>

            <div
            className="flex flex-col w-full"
            >
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" value={formData.email} placeholder="email" onChange={handleChange} onBlur={validateEmail}
                className="w-full border-1 border-gray-700 rounded-lg px-2 focus:outline-none"
                />
                <h1>{error.email}</h1>
            </div>

            <select id="status" onChange={handleChange} onBlur={handlePasswordChange}
            className="w-full "
            >
                <option value="" hidden>Are you a designer?</option>
                <option value="designer">Yes</option>
                <option value="non_designer">No</option>
            </select>

            <div>
                <label htmlFor="password">Password</label>
                <input type={showPassword ? "text" : "password"} id="password" value={formData.password} placeholder="create password" onChange={handleChange} onBlur={handlePasswordChange}
                 className="w-full border-1 border-gray-700 rounded-lg px-2 focus:outline-none"
                />
                {showPassword ? 
                <FaEyeSlash onClick={() => setShowPassword(prev => !prev)}/>
                 : 
                 <FaEye  onClick={() => setShowPassword(prev => !prev)}/>}
                {`${passwordStrength}`}
                <h1>{error.password}</h1>
            </div>

            <div>
                <label htmlFor="cpassword">Confirm Password</label>
                <input type={showCPassword ? "text" : "password"} id="cpassword" placeholder="confirm password" onBlur={confirmPassword} 
                className="w-full border-1 border-gray-700 rounded-lg px-2 focus:outline-none"
                />
                {showCPassword ? 
                <FaEyeSlash onClick={() => setShowCPassword(prev => !prev)}/>
                 : 
                 <FaEye  onClick={() => setShowCPassword(prev => !prev)}/>}
                <h1>{error.cpassword}</h1>
            </div>
            <div
            className=" mx-auto"
            >
                <button
                className="border-1 rounded-lg px-2 bg-gray-700 text-gray-50 cursor-pointer"
                >submit</button>
            </div>
        </form>
        </div>
    )
}

export default UserRegistration;