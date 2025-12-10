import { useState, useEffect } from "react"
import { BASE_URL } from "../Url"
import logo from "../images/mainLogo.jpg"
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
const UserRegistration = () => {
    const url = BASE_URL
    const [showPassword, setShowPassword] = useState(false)
    const [showCPassword, setShowCPassword] = useState(false)
    const [isSubmiting, setISsubmitting] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState("")
    const [usernameVerificationMessage, setUsernameVerificationMessage] = useState("")
    const [showUSernameVerificationMessage, setShowUsernameVerificationMessage] = useState(false)
    const [showMessage, setShowMessage] = useState({
        fname: false,
        lname: false,
        username: false,
        email: false,
        status: false,
        password: false,
        cpassword: false,
    })
    const [error, setError] = useState({})
    const [formData, setFormData] = useState({
        fname: "",
        lname: "",
        username: "",
        email: "",
        status: "",
        password: "",
    })

    const validateFormInput = (event) => {
        // extract the id and value of each form input 
        const {id, value, name} = event.target
        // update the formdata with the values and id of the form input
        setFormData(prev => ({
            ...prev, [id]: value
        }))
        setShowMessage(prev => ({...prev, [id] : true}))
        // check if the formdata have any empty field
         if (value.trim() === "") {
            setError(prev => ({
            ...prev,
            [id]: `${name} is required`
            }));
            return;
        } else {
            setError(prev => {
            const newErr = { ...prev };
            delete newErr[id];
            return newErr;
            });
        }
        // validate the email address
        if (id === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
            setError(prev => ({
            ...prev,
            email: "Invalid email format"
                }));
            }else {
                setError(prev => {
                    const newErr = { ...prev };
                    delete newErr.email;
                    return newErr;
                });
        }
        }

        // validate password
        //  Password strength validation
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
        if (id === "cpassword") {
            if (value !== formData.password) {
            setError(prev => ({
                ...prev,
                cpassword: "Passwords do not match"
            }));
        } else {
        setError(prev => {
            const newErr = { ...prev };
            delete newErr.cpassword;
            return newErr;
            });
        }
        }
};

const validateUsername = async(event) => {
    const {id, value} = event.target
   
    if (id === "username") {
            try {
                let response = await fetch (`${url}/users/username`, {
                    method: "POST",
                    body: JSON.stringify({username: value})
                }) 
                let data = await response.json()
                console.log(data)
                setUsernameVerificationMessage(true)
                setShowUsernameVerificationMessage(data.message)

            }catch(error) {

            }
        }
}

    const handleSubmit = async(event) => {
        event.preventDefault()
        let hasError = false

        const validateForm = () => {
            for (let id in formData) {
                const formValue = formData[id]
                if (formValue.length === 0) {
                    hasError = true
                    setError(prev => ({...prev, [id]:"field required"}))
                    setShowMessage(prev => ({...prev, [id] : true}))
                }
            }
            console.log(error)
            console.log(hasError)
            return hasError
        }

        validateForm()

        if (Object.keys(error).length === 0 || !hasError) {
            try {
                let response = await fetch(`${url}/users`, {
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
        className="w-full flex flex-col px-4 py-4 min-h-screen font-[abril] text-lg gap-4 pb-[75px] 
        md:text-2xl
        md:w-[50%] md:mx-auto
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
                <input type="text" name="first name" id="fname" value={formData.fname} placeholder="first name" onChange={validateFormInput} onBlur={validateFormInput}
                className="w-full border-1 border-gray-700 rounded-lg px-2 focus:outline-none"
                />
                {
                    showMessage.fname && 
                    <h1
                    className="text-red-300"
                    >{error.fname}</h1>
                }
            </div>
            
            <div
            className="flex flex-col w-full"
            >
                <label htmlFor="lname">Last Name</label>
                <input type="text" name="last name" id="lname" value={formData.lname} placeholder="last name" onChange={validateFormInput} onBlur={validateFormInput}
                className="w-full border-1 border-gray-700 rounded-lg px-2 focus:outline-none"
                />
                {
                    showMessage.lname && 
                    <h1
                    className="text-red-300"
                    >{error.lname}</h1>
                }
            </div>

            <div
            
            className="flex flex-col w-full">
                <label htmlFor="username">Username</label>
                <input type="text" name="username" id="username" value={formData.username} placeholder="username" onChange={validateFormInput} onBlur={validateFormInput}
                className="w-full border-1 border-gray-700 rounded-lg px-2 focus:outline-none"
                />
                {
                    showMessage.username && 
                    <h1
                    className="text-red-300"
                    >{error.username}</h1>
                }
                {showUSernameVerificationMessage &&
                <h1 className={`${usernameVerificationMessage === "Username already taken" ? "text-red-300" : "text-green-400"}`}>{usernameVerificationMessage}</h1>
                }
            </div>

            <div
            className="flex flex-col w-full"
            >
                <label htmlFor="email">Email Address</label>
                <input type="email" name="email" id="email" value={formData.email} placeholder="email" onChange={validateFormInput} onBlur={validateFormInput}
                className="w-full border-1 border-gray-700 rounded-lg px-2 focus:outline-none"
                />
                {
                    showMessage.email && 
                    <h1
                    className="text-red-300"
                    >{error.email}</h1>
                }
            </div>
            <div>
            <select name="status" id="status" onChange={validateFormInput} onBlur={validateFormInput}
            className="w-full "
            >
                <option value="" hidden>Are you a designer?</option>
                <option value="designer">Yes</option>
                <option value="non_designer">No</option>
            </select>
                {
                    showMessage.email && 
                    <h1
                    className="text-red-300"
                    >{error.status}</h1>
                }
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <div
                className="flex items-center gap-2"
                >
                    <input type={showPassword ? "text" : "password"} name="password" id="password" value={formData.password} placeholder="create password" onChange={validateFormInput} onBlur={validateFormInput}
                    className="w-full border-1 border-gray-700 rounded-lg px-2 focus:outline-none"
                    />
                    {showPassword ? 
                    <FaEyeSlash onClick={() => setShowPassword(prev => !prev)}/>
                    : 
                    <FaEye  onClick={() => setShowPassword(prev => !prev)}/>}
                </div>
                <h1
                className={`${passwordStrength === "weak" ? "text-red-300 ": passwordStrength === "moderate" ? "text-yellow-300" : "text-green-400"}`}
                >
                    {`${passwordStrength}`}
                </h1>
                {
                    showMessage.password && 
                    <h1
                    className="text-red-300"
                    >{error.password}</h1>
                }
            </div>

            <div>
                <label htmlFor="cpassword">Confirm Password</label>
                <div
                className="flex items-center gap-2"
                >
                    <input type={showCPassword ? "text" : "password"} name="confirm password" id="cpassword" placeholder="confirm password" onBlur={validateFormInput} 
                    className="w-full border-1 border-gray-700 rounded-lg px-2 focus:outline-none"
                    />
                    {showCPassword ? 
                    <FaEyeSlash onClick={() => setShowCPassword(prev => !prev)}/>
                    : 
                    <FaEye  onClick={() => setShowCPassword(prev => !prev)}/>}
                 </div>
                {
                    showMessage.cpassword && 
                    <h1
                    className="text-red-300"
                    >{error.cpassword}</h1>
                }
            </div>
            <div
            className=" mx-auto"
            >
                <button
                disabled = {isSubmiting}
                className={`border-1 rounded-lg px-2 bg-gray-700 text-gray-50 cursor-pointer`}
                >
                {isSubmiting ? "submitting..." : "submit"}
                </button>
            </div>
        </form>
        </div>
    )
}

export default UserRegistration;