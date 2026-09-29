import { useState, useEffect, useContext } from "react"
import { BASE_URL } from "../../Url"
import logo from "../../assets/images/mainLogo.jpg"
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import deliveryRoute from "../../components/common/deliveryRoute";

const UserRegistration = () => {
    const url = BASE_URL
    const navigate = useNavigate()
    const { setAuth, verifyAndFetchAuth } = useContext(AuthContext)
    const [showPassword, setShowPassword] = useState(false)
    const [showCPassword, setShowCPassword] = useState(false)
    const [isSubmiting, setIsSubmitting] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState("")
    const [serverError, setServerError] = useState(null)

    const [showMessage, setShowMessage] = useState({
        fname: false,
        lname: false,
        username: false,
        email: false,
        status: false,
        password: false,
        cpassword: false,
        terms: false,
    })
    const [error, setError] = useState({})
    const [formData, setFormData] = useState({
        fname: "",
        lname: "",
        username: "",
        email: "",
        password: "",
        cpassword: "",
        deliveryRoute: "",
        termsAndCondition: false,
    })

    const validateFormInput = async(event) => {
        const {id, value, name, type, checked} = event.target
        const fieldValue = type === "checkbox" ? checked : value
        const nextFormData = { ...formData, [id]: fieldValue }
        setFormData(nextFormData)
        setShowMessage(prev => ({...prev, [id] : true}))

        if (type === "checkbox") {
            if (!checked) {
                setError(prev => ({ ...prev, terms: "You must accept the terms and conditions" }))
                setShowMessage(prev => ({ ...prev, terms: true }))
            } else {
                setError(prev => {
                    const newErr = { ...prev }
                    delete newErr.terms
                    return newErr
                })
                setShowMessage(prev => ({ ...prev, terms: false }))
            }
            return;
        }

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
        // verify username
        if (id === "username") {
            if (value.length < 5) {
                setError(prev => ({...prev, [id]: "username too short (min 5 characters)"}))
                setShowMessage(prev => ({...prev, [id]: true}))
            }else if (!/^[A-Za-z][A-Za-z0-9]*$/.test(value)) {
                setError(prev => ({...prev, [id]: "username must start with a letter and contain only letters or numbers"}))
                setShowMessage(prev => ({...prev, [id]: true}))
            } else {

                try {
                    let response = await fetch (`${url}/users/username`, {
                        method : "POST",
                        headers : {"Content-Type" : "application/json"},
                        body: JSON.stringify({username:value})
                    })
                    let data = await response.json()
                    console.log(data)

                    if (data.status === "exists") {
                        setError(prev => ({...prev, [id]: data.message}))
                        setShowMessage(prev => ({...prev, [id]: true}))
                    } else {
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
            if (emailRegex.test(value) ) {
                    let response = await fetch(`${url}/users/email`, {
                        method: "POST",
                        headers : {
                            "Content-Type": "application/json"
                        },
                        body : JSON.stringify({email:value})
                    })
                    let data = await response.json()

                    if (data.status === "exists") {
                        setError(prev => ({...prev, [id]: data.message}))
                        setShowMessage(prev => ({...prev, [id]: true}))
                    } else {
                        setError(prev => {
                        const newErr = { ...prev };
                        delete newErr.email;
                        return newErr;
                    });
                        setShowMessage(prev => ({...prev, [id]: true}))
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
};



    const handleSubmit = async(event) => {
        event.preventDefault()
        setIsSubmitting(true)
        const validationErrors = {}

        for (const [id, formValue] of Object.entries(formData)) {
            if (id === "termsAndCondition") {
                if (!formValue) validationErrors.terms = "You must accept the terms and conditions"
                continue
            }
            if (typeof formValue !== "string" || formValue.trim() === "") {
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
                if (data.status === "exists") validationErrors.email = data.message
            }
        } catch (validationError) {
            setServerError(validationError)
            setIsSubmitting(false)
            return
        }

        setError(validationErrors)
        setShowMessage(prev => ({
            ...prev,
            ...Object.fromEntries(Object.keys(validationErrors).map(id => [id, true]))
        }))

        if (Object.keys(validationErrors).length === 0) {
            try {
                const response = await fetch(`${url}/users/registration`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body : JSON.stringify({ ...formData, termsAndCondition: Boolean(formData.termsAndCondition) })
                })
                const data = await response.json()
                if (data.success) {
                    await verifyAndFetchAuth();
                    navigate("/")
                } else {
                    alert(data.message)
                    setIsSubmitting(false)
                }
                if(!data.success && data.message === "Server error") {
                    setServerError({message: "Server error. Please try again later."})
                    setIsSubmitting(false)
                }     
            } catch(error){
                console.log(error)
                setServerError(error)
                setIsSubmitting(false)
            }
        } else {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-slate-100 px-4 py-8">
            <div className="w-full max-w-xl">
                <div className="rounded-[30px] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-7">
                    <div className="mb-6 flex flex-col items-center text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-white shadow-md ring-4 ring-rose-50">
                            <img src={logo} alt="amanisky" className="h-12 w-12 rounded-full object-cover" />
                        </div>
                        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
                        <p className="mt-2 text-sm text-slate-500">Sign up to start shopping with AmaniSky</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex flex-col w-full">
                                <label htmlFor="fname" className="mb-1 text-sm font-semibold text-slate-700">First Name</label>
                                <input
                                    type="text"
                                    name="first name"
                                    id="fname"
                                    value={formData.fname}
                                    placeholder="First name"
                                    onChange={validateFormInput}
                                    onBlur={validateFormInput}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                                />
                                {showMessage.fname && <h1 className="mt-1 text-sm text-red-500">{error.fname}</h1>}
                            </div>

                            <div className="flex flex-col w-full">
                                <label htmlFor="lname" className="mb-1 text-sm font-semibold text-slate-700">Last Name</label>
                                <input
                                    type="text"
                                    name="last name"
                                    id="lname"
                                    value={formData.lname}
                                    placeholder="Last name"
                                    onChange={validateFormInput}
                                    onBlur={validateFormInput}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                                />
                                {showMessage.lname && <h1 className="mt-1 text-sm text-red-500">{error.lname}</h1>}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex flex-col w-full">
                                <label htmlFor="username" className="mb-1 text-sm font-semibold text-slate-700">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    id="username"
                                    value={formData.username}
                                    placeholder="Username"
                                    onChange={validateFormInput}
                                    onBlur={validateFormInput}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                                />
                                {showMessage.username && <h1 className="mt-1 text-sm text-red-500">{error.username}</h1>}
                            </div>

                            <div className="flex flex-col w-full">
                                <label htmlFor="email" className="mb-1 text-sm font-semibold text-slate-700">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    placeholder="Email address"
                                    onChange={validateFormInput}
                                    onBlur={validateFormInput}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                                />
                                {showMessage.email && <h1 className="mt-1 text-sm text-red-500">{error.email}</h1>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 shadow-sm transition focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    placeholder="Create password"
                                    onChange={validateFormInput}
                                    onBlur={validateFormInput}
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
                            {showMessage.password && <h1 className="text-sm text-red-500">{error.password}</h1>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="cpassword" className="text-sm font-semibold text-slate-700">Confirm Password</label>
                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 shadow-sm transition focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100">
                                <input
                                    type={showCPassword ? "text" : "password"}
                                    name="confirm password"
                                    id="cpassword"
                                    value={formData.cpassword}
                                    placeholder="Confirm password"
                                    onChange={validateFormInput}
                                    onBlur={validateFormInput}
                                    className="w-full border-0 bg-transparent py-3 text-slate-900 outline-none placeholder:text-slate-400"
                                />
                                {showCPassword ? (
                                    <FaEyeSlash onClick={() => setShowCPassword((prev) => !prev)} className="cursor-pointer text-slate-500" />
                                ) : (
                                    <FaEye onClick={() => setShowCPassword((prev) => !prev)} className="cursor-pointer text-slate-500" />
                                )}
                            </div>
                            {showMessage.cpassword && <h1 className="text-sm text-red-500">{error.cpassword}</h1>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="deliveryRoute" className="text-sm font-semibold text-slate-700">Delivery Company</label>
                            <select
                                id="deliveryRoute"
                                name="delivery company"
                                value={formData.deliveryRoute}
                                onChange={validateFormInput}
                                onBlur={validateFormInput}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 shadow-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                            >
                                <option value="">Select delivery company</option>
                                <optgroup label="Courier and logistics">
                                    {deliveryRoute
                                        .filter(({ category }) => category === "Courier and logistics")
                                        .map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                </optgroup>
                                <optgroup label="Interstate transport and cargo">
                                    {deliveryRoute
                                        .filter(({ category }) => category === "Interstate transport and cargo")
                                        .map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                </optgroup>
                                <option value="other">Other</option>
                            </select>
                            {showMessage.deliveryRoute && error.deliveryRoute && (
                                <h1 className="text-sm text-red-500">{error.deliveryRoute}</h1>
                            )}
                        </div>

                        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 shadow-sm">
                            <input
                                type="checkbox"
                                id="termsAndCondition"
                                checked={formData.termsAndCondition}
                                onChange={validateFormInput}
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span>
                                I agree to the <a href="/terms" target="_blank" rel="noreferrer" className="text-amber-600 underline">Terms and Conditions</a> and understand my account data will be used to manage my profile.
                            </span>
                        </label>
                        {showMessage.terms && error.terms && <h1 className="text-sm text-red-500">{error.terms}</h1>}

                        <div className="pt-2 text-center">
                            <button
                                disabled={isSubmiting}
                                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                                {isSubmiting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UserRegistration;