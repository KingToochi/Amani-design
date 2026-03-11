import { useContext, useState } from "react"
import { BASE_URL } from "../Url"
import { FaEye, FaEyeSlash, FaUpload, FaCheckCircle, FaExclamationCircle } from "react-icons/fa"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "./marketPlace/hooks/AuthProvider"

const DesignerRegistration = () => {
    const url = BASE_URL
    const navigate = useNavigate()
    const { setAuth } = useContext(AuthContext)
    
    // State management
    const [passwordStrength, setPasswordStrength] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showCPassword, setShowCPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        fname: "",
        lname: "",
        username: "",
        email: "",
        dob: "",
        address: "",
        city: "",
        state: "",
        phoneNumber: "",
        proofOfAddress: null,
        profilePicture: null,
        meansOfIdentification: "",
        identificationNumber: "",
        password: "",
        cpassword: "",
    })
    const [error, setError] = useState({})
    const [touched, setTouched] = useState({})

    // File input refs for clearing
    const [fileInputs, setFileInputs] = useState({
        proofOfAddress: null,
        profilePicture: null
    })

    // Password strength checker
    const checkPasswordStrength = (password) => {
        let strength = 0
        if (password.length >= 8) strength++
        if (/[A-Z]/.test(password)) strength++
        if (/[a-z]/.test(password)) strength++
        if (/\d/.test(password)) strength++
        if (/[^A-Za-z0-9]/.test(password)) strength++

        if (strength <= 2) return "weak"
        if (strength <= 4) return "moderate"
        return "strong"
    }

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validateUsername = (username) => {
        return /^[A-Za-z][A-Za-z0-9]*$/.test(username)
    }

    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^[0-9]{10,15}$/
        return phoneRegex.test(phone)
    }

    // Handle input changes
    const handleInputChange = async (event) => {
        const { id, value, files, type } = event.target
        
        // Handle file inputs
        if (type === "file") {
            const file = files?.[0]
            if (file) {
                // Validate file
                const validTypes = ["image/png", "image/jpeg", "image/jpg"]
                const maxSize = 2 * 1024 * 1024 // 2MB

                if (!validTypes.includes(file.type)) {
                    setError(prev => ({
                        ...prev, 
                        [id]: "Invalid file type. Only JPEG, PNG, and JPG are allowed"
                    }))
                    event.target.value = null // Clear the input
                    return
                }

                if (file.size > maxSize) {
                    setError(prev => ({
                        ...prev, 
                        [id]: "File size exceeds the limit (2MB)"
                    }))
                    event.target.value = null // Clear the input
                    return
                }

                // File is valid
                setFormData(prev => ({ ...prev, [id]: file }))
                setError(prev => {
                    const newErr = { ...prev }
                    delete newErr[id]
                    return newErr
                })
            }
            return
        }

        // Handle regular inputs
        setFormData(prev => ({ ...prev, [id]: value }))

        // Real-time validation for certain fields
        if (id === "password") {
            const strength = checkPasswordStrength(value)
            setPasswordStrength(strength)
        }

        if (id === "cpassword" && formData.password) {
            if (value !== formData.password) {
                setError(prev => ({ ...prev, cpassword: "Passwords do not match" }))
            } else {
                setError(prev => {
                    const newErr = { ...prev }
                    delete newErr.cpassword
                    return newErr
                })
            }
        }
    }

    // Handle blur events (validation on exit)
    const handleBlur = async (event) => {
        const { id, value } = event.target
        setTouched(prev => ({ ...prev, [id]: true }))

        // Skip validation for empty fields (will be caught on submit)
        if (!value || value.trim() === "") {
            setError(prev => ({ ...prev, [id]: `${id} is required` }))
            return
        }

        // Field-specific validation
        switch (id) {
            case "email":
                if (!validateEmail(value)) {
                    setError(prev => ({ ...prev, email: "Invalid email format" }))
                } else {
                    try {
                        const response = await fetch(`${url}/users/email`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: value })
                        })
                        const data = await response.json()
                        if (data.status === "exist") {
                            setError(prev => ({ ...prev, email: "Email already exists" }))
                        } else {
                            setError(prev => {
                                const newErr = { ...prev }
                                delete newErr.email
                                return newErr
                            })
                        }
                    } catch (error) {
                        console.log("Email validation error:", error)
                    }
                }
                break

            case "username":
                if (value.length < 5) {
                    setError(prev => ({ 
                        ...prev, 
                        username: "Username must be at least 5 characters" 
                    }))
                } else if (!validateUsername(value)) {
                    setError(prev => ({ 
                        ...prev, 
                        username: "Username must start with a letter and contain only letters or numbers" 
                    }))
                } else {
                    try {
                        const response = await fetch(`${url}/users/username`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ username: value })
                        })
                        const data = await response.json()
                        if (data.status === "exists") {
                            setError(prev => ({ ...prev, username: "Username already taken" }))
                        } else {
                            setError(prev => {
                                const newErr = { ...prev }
                                delete newErr.username
                                return newErr
                            })
                        }
                    } catch (error) {
                        console.log("Username validation error:", error)
                    }
                }
                break

            case "phoneNumber":
                if (!validatePhoneNumber(value)) {
                    setError(prev => ({ 
                        ...prev, 
                        phoneNumber: "Phone number must be 10-15 digits" 
                    }))
                } else {
                    setError(prev => {
                        const newErr = { ...prev }
                        delete newErr.phoneNumber
                        return newErr
                    })
                }
                break

            default:
                // Clear error for this field if it exists
                setError(prev => {
                    const newErr = { ...prev }
                    delete newErr[id]
                    return newErr
                })
        }
    }

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault()
        setIsSubmitting(true)

        // Validate all required fields
        const requiredFields = [
            "fname", "lname", "email", "username", "phoneNumber",
            "dob", "address", "city", "state", "meansOfIdentification",
            "identificationNumber", "password", "cpassword"
        ]

        let hasErrors = false
        const newErrors = {}

        // Check required fields
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === "") {
                newErrors[field] = `${field} is required`
                hasErrors = true
            }
        })

        // Check file uploads
        if (!formData.proofOfAddress) {
            newErrors.proofOfAddress = "Proof of address is required"
            hasErrors = true
        }
        if (!formData.profilePicture) {
            newErrors.profilePicture = "Profile picture is required"
            hasErrors = true
        }

        // Password match check
        if (formData.password !== formData.cpassword) {
            newErrors.cpassword = "Passwords do not match"
            hasErrors = true
        }

        if (hasErrors) {
            setError(newErrors)
            setIsSubmitting(false)
            window.scrollTo(0, 0)
            return
        }

        // Prepare FormData for submission
        const form = new FormData()
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== "") {
                form.append(key, formData[key])
            }
        })

        try {
            const response = await fetch(`${url}/users/registration/designers`, {
                method: "POST",
                body: form
            })
            
            const data = await response.json()
            
            if (data.success) {
                localStorage.setItem("token", data.token)
                const decoded = jwtDecode(data.token)
                setAuth({
                    id: decoded._id,
                    email: decoded.email,
                    username: decoded.username,
                    status: decoded.status,
                    exp: decoded.exp,
                    iat: decoded.iat,
                })
                navigate("/designer")
            } else {
                alert(data.message || "Registration failed")
                setIsSubmitting(false)
            }
        } catch (error) {
            console.log("Submission error:", error)
            alert("An error occurred during registration")
            setIsSubmitting(false)
        }
    }

    // Get password strength color
    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case "weak": return "text-red-500"
            case "moderate": return "text-yellow-500"
            case "strong": return "text-green-500"
            default: return "text-gray-500"
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                    Designer Registration
                </h1>
                
                <form onSubmit={handleSubmit} 
                      className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    
                    {/* Personal Information Section */}
                    <div className="border-b pb-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    id="fname"
                                    value={formData.fname}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                        ${touched.fname && error.fname ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter your first name"
                                />
                                {touched.fname && error.fname && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {error.fname}
                                    </p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    id="lname"
                                    value={formData.lname}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                        ${touched.lname && error.lname ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter your last name"
                                />
                                {touched.lname && error.lname && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {error.lname}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                        ${touched.email && error.email ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter your email"
                                />
                                {touched.email && error.email && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {error.email}
                                    </p>
                                )}
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                        ${touched.username && error.username ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Choose a username"
                                />
                                {touched.username && error.username && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {error.username}
                                    </p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                        ${touched.phoneNumber && error.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter your phone number"
                                />
                                {touched.phoneNumber && error.phoneNumber && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {error.phoneNumber}
                                    </p>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    id="dob"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                        ${touched.dob && error.dob ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {touched.dob && error.dob && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {error.dob}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="border-b pb-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                            Address Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Street Address *
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                        ${touched.address && error.address ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter your street address"
                                />
                                {touched.address && error.address && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {error.address}
                                    </p>
                                )}
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City/Town *
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                        ${touched.city && error.city ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter your city"
                                />
                                {touched.city && error.city && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {error.city}
                                    </p>
                                )}
                            </div>

                            {/* State */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State *
                                </label>
                                <input
                                    type="text"
                                    id="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                        ${touched.state && error.state ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter your state"
                                />
                                {touched.state && error.state && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {error.state}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* File Uploads Section */}
                    <div className="border-b pb-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                            Document Uploads
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Proof of Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Proof of Address *
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="proofOfAddress"
                                        accept="image/*"
                                        onChange={handleInputChange}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('proofOfAddress').click()}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                                    >
                                        <FaUpload />
                                        {formData.proofOfAddress ? 
                                            formData.proofOfAddress.name : 
                                            'Choose file'
                                        }
                                    </button>
                                </div>
                                {error.proofOfAddress && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {error.proofOfAddress}
                                    </p>
                                )}
                                {formData.proofOfAddress && !error.proofOfAddress && (
                                    <p className="mt-1 text-sm text-green-500 flex items-center gap-1">
                                        <FaCheckCircle /> File selected
                                    </p>
                                )}
                            </div>

                            {/* Profile Picture */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Profile Picture *
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="profilePicture"
                                        accept="image/*"
                                        onChange={handleInputChange}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('profilePicture').click()}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                                    >
                                        <FaUpload />
                                        {formData.profilePicture ? 
                                            formData.profilePicture.name : 
                                            'Choose file'
                                        }
                                    </button>
                                </div>
                                {error.profilePicture && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {error.profilePicture}
                                    </p>
                                )}
                                {formData.profilePicture && !error.profilePicture && (
                                    <p className="mt-1 text-sm text-green-500 flex items-center gap-1">
                                        <FaCheckCircle /> File selected
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Identification Section */}
                    <div className="border-b pb-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                            Identification
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Means of Identification */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Means of Identification *
                                </label>
                                <select
                                    id="meansOfIdentification"
                                    value={formData.meansOfIdentification}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            meansOfIdentification: e.target.value,
                                            identificationNumber: ""
                                        }))
                                    }}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                        ${touched.meansOfIdentification && error.meansOfIdentification ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Select identification type</option>
                                    <option value="nin">National Identification Number (NIN)</option>
                                    <option value="vin">Voter's Card</option>
                                    <option value="passport">International Passport</option>
                                    <option value="driversLicense">Driver's License</option>
                                </select>
                                {touched.meansOfIdentification && error.meansOfIdentification && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {error.meansOfIdentification}
                                    </p>
                                )}
                            </div>

                            {/* Identification Number */}
                            {formData.meansOfIdentification && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Identification Number *
                                    </label>
                                    <input
                                        type="text"
                                        id="identificationNumber"
                                        value={formData.identificationNumber}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                            ${touched.identificationNumber && error.identificationNumber ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder={`Enter your ${
                                            formData.meansOfIdentification === 'nin' ? 'NIN' :
                                            formData.meansOfIdentification === 'vin' ? 'Voter\'s Card' :
                                            formData.meansOfIdentification === 'passport' ? 'Passport' :
                                            'Driver\'s License'
                                        } number`}
                                    />
                                    {touched.identificationNumber && error.identificationNumber && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                            <FaExclamationCircle /> {error.identificationNumber}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="border-b pb-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                            Security
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10
                                            ${touched.password && error.password ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Create a password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {formData.password && (
                                    <p className={`mt-1 text-sm ${getPasswordStrengthColor()}`}>
                                        Password strength: {passwordStrength}
                                    </p>
                                )}
                                {touched.password && error.password && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {error.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCPassword ? "text" : "password"}
                                        id="cpassword"
                                        value={formData.cpassword}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10
                                            ${touched.cpassword && error.cpassword ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCPassword(!showCPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    >
                                        {showCPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {touched.cpassword && error.cpassword && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <FaExclamationCircle /> {error.cpassword}
                                    </p>
                                )}
                                {formData.cpassword && formData.password === formData.cpassword && (
                                    <p className="mt-1 text-sm text-green-500 flex items-center gap-1">
                                        <FaCheckCircle /> Passwords match
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : "Register as Designer"}
                        </button>
                    </div>

                    {/* Error Summary */}
                    {Object.keys(error).length > 0 && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h3 className="text-red-800 font-semibold mb-2 flex items-center gap-2">
                                <FaExclamationCircle /> Please fix the following errors:
                            </h3>
                            <ul className="list-disc list-inside text-red-600 text-sm">
                                {Object.entries(error).map(([key, value]) => (
                                    <li key={key}>{value}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}

export default DesignerRegistration