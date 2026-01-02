import { useState, useNavigate } from "react"
import { BASE_URL } from "../Url"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { jwtDecode } from "jwt-decode"

const DesignerREgistration = () => {
    const url = BASE_URL
    const navigate = useNavigate
    const [passwordStrength, setPasswordStrength] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showCPassword, setShowCPassword] = useState(false)
    const [formData, setformData] = useState({
        fname : "",
        lname : "",
        username : "",
        email: "",
        dob: "",
        address: "",
        city: "",
        state: "",
        phoneNumber: "",
        proofOfAddress: "",
        profilePicture: "",
        meansOfIdentification: "",
        identificationNumber: "",
        password: "",
        cpassword: "",
    })
    const [error, setError] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const formInputValidation = async(event) => {
        const {name, id, value, files} = event.target
        const file = files?.[0]
        if (id === "profilePicture" || id === "proofOfAddress") {
            if (!file) {
                setError(prev=> ({...prev, [id] : `not an image`}))
                return
            }

            const validTypes =["image/png", "image/jpeg", "image/jpg"]
            if (!validTypes.includes(file.type)) {
                setError(prev=> ({...prev, [id]:"invalid type. only jpeg, png,jpg are allowed" }))
                value = null
                return
            }

            const maxSize = 2 * 1024 * 1024
            if (file.size > maxSize) {
                setError(prev=> ({...prev, [id]:"file size exceeds the limit (2mb)" }))
                return
            }else{
                setformData(prev => ({
            ...prev, [id]: file
            }))
                setError(prev => {
                const newErr = {...prev}
                delete newErr[id]
                return newErr
            })
            }
            return
        }
         setformData(prev => ({
            ...prev, [id]: value
        }))
        if (value.trim() === "") {
            setError(prev => ({
                ...prev, [id]: `this feild is required`
            }))
            return
        } else{
            setError(prev => {
                const newErr = {...prev}
                delete newErr[id]
                return newErr
            })
        }

        if (id === "username") {
            if (value.length < 5) {
                setError(prev => ({...prev, [id]: `${name} too short (min 5 characters)`}))
            }else if (!/^[A-Za-z][A-Za-z0-9]*$/.test(value)) {
                setError(prev => ({...prev, [id]: "username must start with a letter and contain only letters or numbers"}))
            }else {
                try{
                    let response = await fetch(`${url}/users/username`, {
                        method: "POST",
                        headers:{"Content-Type": "application/json"},
                        body: JSON.stringify({id:value})
                    })
                    let data = await response.json()
                    if (data.status === "exists") {
                        setError(prev => ({...prev, [id]: data.message}))
                    }else {
                        setError(prev => {
                            let newErr = {...prev}
                            delete newErr.username
                            return newErr
                        })
                        console.log(error)
                    }
                }catch(error){
                    console.log(error)
                }
            }
        }

        if (id === "email"){
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
            if (emailRegex.test(value)) {
                let response = await fetch(`${url}/users/email`, {
                        method: "POST",
                        headers : {
                            "Content-Type": "application/json"
                        },
                        body : JSON.stringify({email:value})
                    })
                    let data = await response.json()

                    if (data.status === "exist") {
                        setError(prev => ({...prev, [id]: data.message}))
                    } else {
                        setError(prev => {
                        const newErr = { ...prev };
                        delete newErr.email;
                        return newErr;
                    });
                    }
                    
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
    }
    const handleSubmit = async(event) => {
            event.preventDefault()
            setIsSubmitting(true)
            let hasError = false
            const form = new FormData()
    
            const validateForm = () => {
                for (let id in formData) {
                    const formValue = formData[id]
                    if (!formValue) {
                        hasError = true
                        setError(prev => ({...prev, [id]:"field required"}))
                        setIsSubmitting(false)
                    } else {
                        form.append(id, formData[id])
                        setError(prev => {
                            const newErr = {...prev}
                            delete newErr[id]
                            return newErr
                        })
                    }
                }
                return hasError
            }
    
    
            validateForm()
            
    
            if (Object.keys(error).length === 0 && !hasError) {
                setIsSubmitting(true)
                try {
                    let response = await fetch(`${url}/users/registration/designers`, {
                        method: "POST",
                        body : form
                    })
                    let data = await response.json()
                    console.log(data)
                    if (data.success) {
                        localStorage.setItem("token", data.token)
                        const decoded = jwtDecode(data.token)
                        if(decoded.status === "designer") {
                            navigate("/designer")
                        } navigate("/")
                    } else {
                        alert(data.message)
                        setIsSubmitting(false)
                    }
                } catch(error){
                    console.log(error)
                    setIsSubmitting(false)
                }
            }else {
                console.log("Form has errors:", error);
                setIsSubmitting(false)
                console.log(error)
            }
        }

    return(
        <div>
            <form onSubmit={handleSubmit}
            className="w-full flex flex-col gap-6 text-lg font-[abril]
            sm:text-xl
            md:text-2xl
            "
            >
                <div
                className="flex flex-col gap-2"
                >
                    <label htmlFor="fname"
                    className="w-full font-semibold"
                    >First Name</label>
                    <input type="text" id="fname" value={formData.fname} placeholder="first name" onBlur={formInputValidation} onChange={formInputValidation}
                    className="w-full border-2 border-gray-900 rounded-lg px-2"
                    />
                    <h1 className="text-red-300">{error?.fname}</h1>
                </div>
                <div
                className="flex flex-col gap-2"
                >
                    <label htmlFor="lname"
                    className="w-full font-semibold"
                    >Last Name</label>
                    <input type="text" id="lname" value={formData.lname} placeholder="last name" onBlur={formInputValidation} onChange={formInputValidation}
                    className="w-full border-2 border-gray-900 rounded-lg px-2"
                    />
                    <h1 className="text-red-300">{error?.lname}</h1>
                </div>
                <div
                className="flex flex-col gap-2"
                >
                    <label htmlFor="email"
                    className="w-full font-semibold"
                    >Email</label>
                    <input type="email" id="email" value={formData.email} placeholder="email" onBlur={formInputValidation} onChange={formInputValidation}
                    className="w-full border-2 border-gray-900 rounded-lg px-2"
                    />
                    <h1 className="text-red-300">{error?.email}</h1>
                </div>
                <div
                className="flex flex-col gap-2"
                >
                    <label htmlFor="username"
                    className="w-full font-semibold"
                    >Username</label>
                    <input type="text" id="username" value={formData.username} placeholder="username" onBlur={formInputValidation} onChange={formInputValidation}
                    className="w-full border-2 border-gray-900 rounded-lg px-2"
                    />
                    <h1 className="text-red-300">{error?.username}</h1>
                </div>
                <div
                className="flex flex-col gap-2"
                >
                    <label htmlFor="phoneNumber"
                    className="w-full font-semibold"
                    >Phone Number</label>
                    <input type="number" id="phoneNumber" value={formData.phoneNumber} placeholder="phone number" onBlur={formInputValidation} onChange={formInputValidation}
                    className="w-full border-2 border-gray-900 rounded-lg px-2"
                    />
                    <h1 className="text-red-300">{error?.phoneNumber}</h1>
                </div>
                <div
                className="flex flex-col gap-2"
                >
                    <label htmlFor="dob"
                    className="w-full font-semibold"
                    >Date of Birth</label>
                    <input type="date" id="dob" value={formData.dob} placeholder="date of birth" onBlur={formInputValidation} onChange={formInputValidation}
                    className="w-full border-2 border-gray-900 rounded-lg px-2"
                    />
                    <h1 className="text-red-300">{error?.dob}</h1>
                </div>
                <div
                className="flex flex-col gap-2"
                >
                    <label htmlFor="address"
                    className="w-full font-semibold"
                    >Address</label>
                    <input type="text" id="address" value={formData.address} placeholder="your street address" onBlur={formInputValidation} onChange={formInputValidation}
                    className="w-full border-2 border-gray-900 rounded-lg px-2"
                    />
                    <h1 className="text-red-300">{error?.address}</h1>
                </div>
                <div
                className="flex flex-col gap-2"
                >
                    <label htmlFor="city"
                    className="w-full font-semibold"
                    >City/Town</label>
                    <input type="text" id="city" value={formData.city} placeholder="Your City" onBlur={formInputValidation} onChange={formInputValidation}
                    className="w-full border-2 border-gray-900 rounded-lg px-2"
                    />
                    <h1 className="text-red-300">{error?.city}</h1>
                </div>
                <div
                className="flex flex-col gap-2"
                >
                    <label htmlFor="state"
                    className="w-full font-semibold"
                    >State</label>
                    <input type="text" id="state" value={formData.state} placeholder="your State" onBlur={formInputValidation} onChange={formInputValidation}
                    className="w-full border-2 border-gray-900 rounded-lg px-2"
                    />
                    <h1 className="text-red-300">{error?.state}</h1>
                </div>
                <div
                className="flex flex-col gap-2"
                >
                    <label htmlFor="proofOfAddress"
                    className="w-full font-semibold"
                    >Proof Of Address</label>
                    <input type="file" accept="image/*" id="proofOfAddress"  placeholder="proof of address"name="proofOfAddress" onChange={formInputValidation}
                    className="w-full border-2 border-gray-900 rounded-lg px-2"
                    />
                    <h1 className="text-red-300">{error?.proofOfAddress}</h1>
                </div>
                <div
                className="flex flex-col gap-2"
                >
                    <label htmlFor="profilePicture"
                    className="w-full font-semibold"
                    >Profile Picture</label>
                    <input type="file" accept="image/*" id="profilePicture"  placeholder="profile picture" name="profilePicture" onChange={formInputValidation}
                    className="w-full border-2 border-gray-900 rounded-lg px-2"
                    />
                    <h1 className="text-red-300">{error?.profilePicture}</h1>
                </div>
                <div
            className="w-full flex flex-col items-start gap-2 "
            >
                <select id="meansOfIdentification" value={formData.meansOfIdentification} 
                onChange={(e)=>{
                    const value = e.target.value
                    setformData(prev => ({
                    ...prev,
                    meansOfIdentification: value,
                    identificationNumber: "" // reset when switching ID type
                    }))
                    setError(prev => {
                    const newErr = { ...prev }
                    delete newErr.meansOfIdentification
                    return newErr
                    })
                } }
                onBlur={formInputValidation}
                className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 font-[abril]">
                    <option value=""hidden >Select Means of Identification</option>
                    <option value="nin">National Identification Number</option>
                    <option value="vin">Voter's Card</option>
                    <option value="passport">International Passport</option>
                    <option value="driversLicense">Driver's License</option>
                </select>
                <h1 className="text-red-300">{error?.meansOfIdentification}</h1>
            </div>
            {formData.meansOfIdentification === "nin" && (
                <div
                className="w-full flex flex-col items-start gap-2 "
                >
                    <input type="text" placeholder="NIN Number" id="identificationNumber" onChange={formInputValidation} onBlur={formInputValidation}
                    className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"/>
                    <h1 className="text-red-300">{error?.identificationNumber}</h1>
                </div>
            )} 
            {formData.meansOfIdentification === "vin" && (
                <div
                className="w-full flex flex-col items-start gap-2 "
                >
                    <input type="text" placeholder="Voter's Card Number" id="identificationNumber" onChange={formInputValidation} onBlur={formInputValidation}
                    className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"/>
                    <h1 className="text-red-300">{error?.identificationNumber}</h1>
                </div>
            )}
            {formData.meansOfIdentification === "passport" && (
                <div
                className="w-full flex flex-col items-start gap-2 "
                >
                    <input type="text" placeholder="Passport Number" id="identificationNumber" onChange={formInputValidation} onBlur={formInputValidation}
                    className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"/>
                    <h1 className="text-red-300">{error?.identificationNumber}</h1>
                </div>
            )}
            {formData.meansOfIdentification === "driversLicense" && (
                <div
                className="w-full flex flex-col items-start gap-2 "
                >
                    <input type="text" placeholder="Driver's License Number" id="identificationNumber" onChange={formInputValidation} onBlur={formInputValidation}
                    className="w-full border-2 rounded-lg border-gray-900 px-2 py-2 text-gray-900 font-semibold text-base font-[abril]"/>
                    <h1 className="text-red-300">{error?.identificationNumber}</h1>
                </div>
            )}
            <div>
                            <label htmlFor="password">Password</label>
                            <div
                            className="flex items-center gap-2"
                            >
                                <input type={showPassword ? "text" : "password"} name="password" id="password" value={formData.password} placeholder="create password" onChange={formInputValidation} onBlur={formInputValidation}
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
                            <h1 className="text-red-300">{error?.password}</h1>
                        </div>
            
                        <div>
                            <label htmlFor="cpassword">Confirm Password</label>
                            <div
                            className="flex items-center gap-2"
                            >
                                <input type={showCPassword ? "text" : "password"} name="confirm password" id="cpassword" placeholder="confirm password" onBlur={formInputValidation} onChange={formInputValidation}
                                className="w-full border-1 border-gray-700 rounded-lg px-2 focus:outline-none"
                                />
                                {showCPassword ? 
                                <FaEyeSlash onClick={() => setShowCPassword(prev => !prev)}/>
                                : 
                                <FaEye  onClick={() => setShowCPassword(prev => !prev)}/>}
                                <h1 className="text-red-300">{error?.cpassword}</h1>
                             </div>
                        </div>
            <div
            className="w-full text-center"
            >
                <button
                disabled={isSubmitting}
                className="border-2 border-gray-900 px-2 py-1 rounded-lg"
                >
                    {isSubmitting ? "submitting" : "submit"}
                </button>
            </div>
            </form>
        </div>
    )
}

export default DesignerREgistration;