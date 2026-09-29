import { useContext, useState } from "react"
import { BASE_URL } from "../../Url"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ServerError from "../../components/common/ServerError";
import BankList from "../../components/common/BankList";


const DesignerRegistration = () => {
    const url = BASE_URL
    const navigate = useNavigate()
    const {setAuth, verifyAndFetchAuth} = useContext(AuthContext)
    const [passwordStrength, setPasswordStrength] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showCPassword, setShowCPassword] = useState(false)
    const [serverError, setServerError] = useState(null)
    const [formData, setformData] = useState({
        fname : "",
        lname : "",
        username : "",
        email: "",
        dob: "",
        houseNumber: "",
        streetName: "",
        city: "",
        state: "",
        typeOfVendor: "",
        bankName: "",
        accountNumber: "",
        phoneNumber: "",
        proofOfAddress: "",
        profilePicture: "",
        meansOfIdentification: "",
        identificationNumber: "",
        password: "",
        cpassword: "",
        termsAndCondition: false,
    })
    const [error, setError] = useState({})
    const [successMessage, setSuccessMessage] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const formInputValidation = async(event) => {
        console.log(event)
        event.preventDefault()
        let {name, id, value, files, type, checked} = event.target
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
        const fieldValue = type === "checkbox" ? checked : value
         setformData(prev => ({
            ...prev, [id]: fieldValue
        }))
        if (type === "checkbox") {
            if (!checked) {
                setError(prev => ({...prev, terms: "You must accept the terms and conditions"}))
            } else {
                setError(prev => {
                    const newErr = {...prev}
                    delete newErr.terms
                    return newErr
                })
            }
            return
        }

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
                        body: JSON.stringify({username:value})
                    })
                    let data = await response.json()
                    if (data.status === "exists") {
                        console.log(data.message)
                        setError(prev => ({...prev, [id]: data.message}))
                        setSuccessMessage(prev => {
                            let newMsg = {...prev}
                            delete newMsg.username
                            return newMsg
                        })  
                    }else {
                        setSuccessMessage(prev => ({...prev, [id]: data.message}))
                        setError(prev => {
                            let newErr = {...prev}
                            delete newErr.username
                            return newErr
                        })
                    }
                }catch(error){
                    console.log(error)
                    setServerError(error)
                    setTimeout(() => {
                        setServerError(null)
                    }, 5000)
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
                try {
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
                        setSuccessMessage(prev => {
                            let newMsg = {...prev}
                            delete newMsg.username
                            return newMsg
                        })  
                    } else {
                        setSuccessMessage(prev => ({...prev, [id]: data.message}))
                        setError(prev => {
                        const newErr = { ...prev };
                        delete newErr.email;
                        return newErr;
                    });
                    }
                } catch(error) {
                    setServerError(error)
                    setTimeout(() => {
                        setServerError(null)
                    }, 5000)
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
        const validationErrors = {}

        for (const [id, formValue] of Object.entries(formData)) {
            if (id === "termsAndCondition") {
                if (!formValue) validationErrors.terms = "You must accept the terms and conditions"
                continue
            }
            if (!formValue || (typeof formValue === "string" && formValue.trim() === "")) {
                validationErrors[id] = "field required"
            }
        }

        if (formData.username && !/^[A-Za-z][A-Za-z0-9]*$/.test(formData.username)) {
            validationErrors.username = "username must start with a letter and contain only letters or numbers"
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            validationErrors.email = "Invalid email format"
        }
        if (formData.cpassword && formData.cpassword !== formData.password) {
            validationErrors.cpassword = "Passwords do not match"
        }

        try {
            if (!validationErrors.username && formData.username) {
                const response = await fetch(`${url}/users/username`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: formData.username })
                })
                const data = await response.json()
                if (data.status === "exists") validationErrors.username = data.message
            }
            if (!validationErrors.email && formData.email) {
                const response = await fetch(`${url}/users/email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: formData.email })
                })
                const data = await response.json()
                if (data.status === "exist") validationErrors.email = data.message
            }
        } catch (validationError) {
            setServerError(validationError)
            setIsSubmitting(false)
            return
        }

        setError(validationErrors)

        if (Object.keys(validationErrors).length === 0) {
            const form = new FormData()
            for (const [key, value] of Object.entries(formData)) {
                if (key === "termsAndCondition") {
                    form.append(key, value ? "true" : "false")
                } else {
                    form.append(key, value)
                }
            }

            try {
                const response = await fetch(`${url}/users/registration/vendor`, {
                        method: "POST",
                        credentials: "include",
                        body : form
                    })
                const data = await response.json()
                if (response.ok && data.success) {
                    const authVerified = await verifyAndFetchAuth();
                    if (authVerified) {
                        navigate("/vendor")
                        return
                    }

                    throw new Error("Registration succeeded, but your session could not be verified.")
                }

                setIsSubmitting(false)
                setServerError(data.message || "Registration failed")
                setTimeout(() => setServerError(null), 5000)
                } catch(error){
                    console.log(error)
                    setServerError(error)
                    setIsSubmitting(false)
                }
        } else {
            setIsSubmitting(false)
        }
    }

        if (serverError) {
            return(
                <ServerError serverError={serverError} />
            )
        }

    return (
        <div className="max-h-[80vh] overflow-y-auto rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6 lg:p-8">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Register as a Designer</h2>
                <p className="mt-2 text-sm text-slate-500">Complete your profile to start selling on AmaniSky Design</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-6 text-base text-slate-700 sm:text-lg">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="fname" className="w-full text-sm font-semibold text-slate-700">First Name</label>
                        <input
                            type="text"
                            id="fname"
                            value={formData.fname}
                            placeholder="First name"
                            onBlur={formInputValidation}
                            onChange={formInputValidation}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <h1 className="text-sm text-red-500">{error?.fname}</h1>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="lname" className="w-full text-sm font-semibold text-slate-700">Last Name</label>
                        <input
                            type="text"
                            id="lname"
                            value={formData.lname}
                            placeholder="Last name"
                            onBlur={formInputValidation}
                            onChange={formInputValidation}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <h1 className="text-sm text-red-500">{error?.lname}</h1>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="w-full text-sm font-semibold text-slate-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            placeholder="Email address"
                            onBlur={formInputValidation}
                            onChange={formInputValidation}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <h1 className="text-sm text-red-500">{error?.email}</h1>
                        <h1 className="text-sm text-emerald-500">{successMessage?.email}</h1>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="username" className="w-full text-sm font-semibold text-slate-700">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={formData.username}
                            placeholder="Username"
                            onBlur={formInputValidation}
                            onChange={formInputValidation}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <h1 className="text-sm text-red-500">{error?.username}</h1>
                        <h1 className="text-sm text-emerald-500">{successMessage?.username}</h1>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="phoneNumber" className="w-full text-sm font-semibold text-slate-700">Phone Number</label>
                        <input
                            type="text"
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            placeholder="Phone number"
                            onBlur={formInputValidation}
                            onChange={formInputValidation}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <h1 className="text-sm text-red-500">{error?.phoneNumber}</h1>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="dob" className="w-full text-sm font-semibold text-slate-700">Date of Birth</label>
                        <input
                            type="date"
                            id="dob"
                            value={formData.dob}
                            placeholder="Date of birth"
                            onBlur={formInputValidation}
                            onChange={formInputValidation}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <h1 className="text-sm text-red-500">{error?.dob}</h1>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="houseNumber" className="w-full text-sm font-semibold text-slate-700">House Number</label>
                        <input
                            type="text"
                            id="houseNumber"
                            value={formData.houseNumber}
                            placeholder="House number"
                            onBlur={formInputValidation}
                            onChange={formInputValidation}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <h1 className="text-sm text-red-500">{error?.houseNumber}</h1>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="streetName" className="w-full text-sm font-semibold text-slate-700">Street Name</label>
                        <input
                            type="text"
                            id="streetName"
                            value={formData.streetName}
                            placeholder="Street name"
                            onBlur={formInputValidation}
                            onChange={formInputValidation}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <h1 className="text-sm text-red-500">{error?.streetName}</h1>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="city" className="w-full text-sm font-semibold text-slate-700">City/Town</label>
                        <input
                            type="text"
                            id="city"
                            value={formData.city}
                            placeholder="City"
                            onBlur={formInputValidation}
                            onChange={formInputValidation}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <h1 className="text-sm text-red-500">{error?.city}</h1>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="state" className="w-full text-sm font-semibold text-slate-700">State</label>
                        <input
                            type="text"
                            id="state"
                            value={formData.state}
                            placeholder="State"
                            onBlur={formInputValidation}
                            onChange={formInputValidation}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <h1 className="text-sm text-red-500">{error?.state}</h1>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="proofOfAddress" className="w-full text-sm font-semibold text-slate-700">Proof of Address</label>
                        <input
                            type="file"
                            accept="image/*"
                            id="proofOfAddress"
                            name="proofOfAddress"
                            onChange={formInputValidation}
                            className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                        />
                        <h1 className="text-sm text-red-500">{error?.proofOfAddress}</h1>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="profilePicture" className="w-full text-sm font-semibold text-slate-700">Profile Picture</label>
                        <input
                            type="file"
                            accept="image/*"
                            id="profilePicture"
                            name="profilePicture"
                            onChange={formInputValidation}
                            className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                        />
                        <h1 className="text-sm text-red-500">{error?.profilePicture}</h1>
                    </div>
                </div>

                <div className="space-y-2">
                    <select
                        id="meansOfIdentification"
                        value={formData.meansOfIdentification}
                        onChange={(e) => {
                            const value = e.target.value;
                            setformData((prev) => ({
                                ...prev,
                                meansOfIdentification: value,
                                identificationNumber: ""
                            }));
                            setError((prev) => {
                                const newErr = { ...prev };
                                delete newErr.meansOfIdentification;
                                return newErr;
                            });
                        }}
                        onBlur={formInputValidation}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    >
                        <option value="" hidden>Select Means of Identification</option>
                        <option value="nin">National Identification Number</option>
                        <option value="vin">Voter's Card</option>
                        <option value="passport">International Passport</option>
                        <option value="driversLicense">Driver's License</option>
                    </select>
                    <h1 className="text-sm text-red-500">{error?.meansOfIdentification}</h1>
                </div>

                {formData.meansOfIdentification === "nin" && (
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="NIN Number"
                            id="identificationNumber"
                            onChange={formInputValidation}
                            onBlur={formInputValidation}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <h1 className="text-sm text-red-500">{error?.identificationNumber}</h1>
                    </div>
                )}
                {formData.meansOfIdentification === "vin" && (
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Voter's Card Number"
                            id="identificationNumber"
                            onChange={formInputValidation}
                            onBlur={formInputValidation}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <h1 className="text-sm text-red-500">{error?.identificationNumber}</h1>
                    </div>
                )}
                {formData.meansOfIdentification === "passport" && (
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Passport Number"
                            id="identificationNumber"
                            onChange={formInputValidation}
                            onBlur={formInputValidation}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <h1 className="text-sm text-red-500">{error?.identificationNumber}</h1>
                    </div>
                )}
                {formData.meansOfIdentification === "driversLicense" && (
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Driver's License Number"
                            id="identificationNumber"
                            onChange={formInputValidation}
                            onBlur={formInputValidation}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <h1 className="text-sm text-red-500">{error?.identificationNumber}</h1>
                    </div>
                )}

                <div className="space-y-2">
                    <select
                        id="typeOfVendor"
                        value={formData.typeOfVendor}
                        onBlur={formInputValidation}
                        onChange={formInputValidation}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    >
                        <option value="" hidden>What type of vendor are you?</option>
                        <option value="manufacturer">Manufacturer</option>
                        <option value="wholesaler">Wholesaler</option>
                        <option value="retailer">Retailer</option>
                    </select>
                    <h1 className="text-sm text-red-500">{error?.typeOfVendor}</h1>
                </div>

                <div className="space-y-2">
                    <label htmlFor="bankName" className="w-full text-sm font-semibold text-slate-700">Bank</label>
                    <BankList
                        id="bankName"
                        value={formData.bankName}
                        formInputValidation={formInputValidation}
                        onChange={(e) => {
                            const value = e.target.value;
                            setformData((prev) => ({
                                ...prev,
                                bankName: value,
                            }));
                            setError((prev) => {
                                const newErr = { ...prev };
                                delete newErr.bankName;
                                return newErr;
                            });
                        }}
                    />
                    <h1 className="text-sm text-red-500">{error?.bankName}</h1>
                </div>

                <div className="space-y-2">
                    <label htmlFor="accountNumber" className="w-full text-sm font-semibold text-slate-700">Account Number</label>
                    <input
                        type="text"
                        id="accountNumber"
                        value={formData.accountNumber}
                        placeholder="Account number"
                        onBlur={formInputValidation}
                        onChange={formInputValidation}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    />
                    <h1 className="text-sm text-red-500">{error?.accountNumber}</h1>
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="w-full text-sm font-semibold text-slate-700">Password</label>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 shadow-sm transition focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            id="password"
                            value={formData.password}
                            placeholder="Create password"
                            onChange={formInputValidation}
                            onBlur={formInputValidation}
                            className="w-full border-0 bg-transparent py-3 text-slate-900 outline-none placeholder:text-slate-400"
                        />
                        {showPassword ? (
                            <FaEyeSlash onClick={() => setShowPassword((prev) => !prev)} className="cursor-pointer text-slate-500" />
                        ) : (
                            <FaEye onClick={() => setShowPassword((prev) => !prev)} className="cursor-pointer text-slate-500" />
                        )}
                    </div>
                    <h1 className={`${passwordStrength === "weak" ? "text-red-500" : passwordStrength === "moderate" ? "text-amber-500" : "text-emerald-500"} text-sm font-medium`}>
                        {passwordStrength}
                    </h1>
                    <h1 className="text-sm text-red-500">{error?.password}</h1>
                </div>

                <div className="space-y-2">
                    <label htmlFor="cpassword" className="w-full text-sm font-semibold text-slate-700">Confirm Password</label>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 shadow-sm transition focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100">
                        <input
                            type={showCPassword ? "text" : "password"}
                            name="confirm password"
                            id="cpassword"
                            placeholder="Confirm password"
                            onBlur={formInputValidation}
                            onChange={formInputValidation}
                            className="w-full border-0 bg-transparent py-3 text-slate-900 outline-none placeholder:text-slate-400"
                        />
                        {showCPassword ? (
                            <FaEyeSlash onClick={() => setShowCPassword((prev) => !prev)} className="cursor-pointer text-slate-500" />
                        ) : (
                            <FaEye onClick={() => setShowCPassword((prev) => !prev)} className="cursor-pointer text-slate-500" />
                        )}
                    </div>
                    <h1 className="text-sm text-red-500">{error?.cpassword}</h1>
                </div>

                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 shadow-sm">
                    <input
                        type="checkbox"
                        id="termsAndCondition"
                        name="termsAndCondition"
                        checked={formData.termsAndCondition}
                        onChange={formInputValidation}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>
                        I agree to the <a href="/terms" target="_blank" rel="noreferrer" className="text-amber-600 underline">Terms and Conditions</a>.
                    </span>
                </label>
                {error.terms && <h1 className="text-sm text-red-500">{error.terms}</h1>}

                <div className="w-full pt-2 text-center">
                    <button
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default DesignerRegistration;