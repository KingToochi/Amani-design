import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {AuthContext} from "../../context/AuthContext"
import { CiEdit } from "react-icons/ci";
import { FaUserCircle, FaEnvelope, FaPhone, FaTag, FaMapMarkerAlt, FaIdCard, FaCamera } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/useFetch";
import LogoutButton from "../../components/common/LogoutButton";
import Popup from "../../components/common/Popup";

const ProfilePage = () => {
    const {setAuth, logout} = useContext(AuthContext)
    const [userDetails, setUserDetails] = useState({})
    const [editProfile, setEditProfile] = useState(false)
    const [updateDetails, setUpdateDetails] = useState({})
    const [updateError, setUpdateError] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [showPhoneVerification, setShowPhoneVerification] = useState(false)
    const [verificationCode, setVerificationCode] = useState("")
    const [verificationError, setVerificationError] = useState("")
    const [isSendingCode, setIsSendingCode] = useState(false)
    const [isVerifyingPhone, setIsVerifyingPhone] = useState(false)
    const [isSendingEmail, setIsSendingEmail] = useState(false)
    const [verificationNotice, setVerificationNotice] = useState("")
    const [isUploadingPicture, setIsUploadingPicture] = useState(false)
    const [profilePictureError, setProfilePictureError] = useState("")
    const [popup, setPopup] = useState({ message: "", type: "success" })
    const profilePictureInputRef = useRef(null)
    const url = BASE_URL

    const navigate = useNavigate()


    const handleUpdateUser = async () => {
        setIsUpdating(true)
        setUpdateError("")

        try {
            const updates = { ...updateDetails }

            if (userDetails.emailVerified || updates.email === userDetails.email) {
                delete updates.email
            }

            if (Object.values(updates).some(value => !String(value ?? "").trim())) {
                throw new Error("Please fill in all profile fields")
            }

            const response = await CustomFetch(`${url}/users/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updates)
            })

            if (!response) return

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Unable to update profile")
            }

            setUserDetails(prev => ({
                ...prev,
                ...updates
            }))
            setEditProfile(false)
            setPopup({ message: "Update successful", type: "success" })
        } catch (error) {
            setUpdateError(error.message || "Unable to update profile")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleEditProfile = () => {
        setUpdateDetails({
            fname: userDetails.fname || "",
            lname: userDetails.lname || "",
            username: userDetails.username || "",
            email: userDetails.email || "",
            phoneNumber: userDetails.phoneNumber || "",
            shippingAddress: userDetails.shippingAddress || "",
            city: userDetails.city || "",
            state: userDetails.state || ""
        })
        setUpdateError("")
        setEditProfile(prev => !prev)
    }

    const handleFieldChange = (field, value) => {
        setUpdateDetails(prev => {
            const nextDetails = {
                ...prev,
                [field]: value
            }

            if (!Object.values(nextDetails).some(fieldValue => !String(fieldValue ?? "").trim())) {
                setUpdateError("")
            }

            return nextDetails
        })
    }

    const handleProfilePictureChange = async (event) => {
        const file = event.target.files?.[0]
        event.target.value = ""

        if (!file) return
        if (!file.type.startsWith("image/")) {
            setProfilePictureError("Please select an image file")
            return
        }

        setIsUploadingPicture(true)
        setProfilePictureError("")

        try {
            const formData = new FormData()
            formData.append("profilePicture", file)

            const response = await CustomFetch(`${url}/users/profile-picture`, {
                method: "POST",
                body: formData
            })
            const data = await response?.json()

            if (!response?.ok) {
                throw new Error(data?.message || "Unable to update profile picture")
            }

            setUserDetails(prev => ({
                ...prev,
                profilePicture: data.profilePicture
            }))
            setPopup({ message: "Update successful", type: "success" })
        } catch (error) {
            setProfilePictureError(error.message || "Unable to update profile picture")
        } finally {
            setIsUploadingPicture(false)
        }
    }

    const handleStartPhoneVerification = async () => {
        setIsSendingCode(true)
        setVerificationError("")

        try {
            const response = await CustomFetch(`${url}/users/phone/send-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: userDetails.phoneNumber }),
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Unable to send verification code")
            }

            setVerificationNotice(data.message || "Verification code sent")
            setPopup({ message: "Verification message sent.", type: "success" })
            setShowPhoneVerification(true)
        } catch (error) {
            setVerificationError(error.message || "Unable to send verification code")
        } finally {
            setIsSendingCode(false)
        }
    }

    const handleResendEmailVerification = async () => {
        setIsSendingEmail(true)
        setVerificationNotice("")
        setVerificationError("")

        try {
            const response = await CustomFetch(`${url}/users/resend-email-verification`, {
                method: "POST",
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Unable to send verification email")
            }

            setVerificationNotice("Verification email sent. Check your inbox.")
            setPopup({ message: "Verification message sent.", type: "success" })
        } catch (error) {
            setVerificationError(error.message || "Unable to send verification email")
        } finally {
            setIsSendingEmail(false)
        }
    }

    const handleVerifyPhone = async () => {
        setIsVerifyingPhone(true)
        setVerificationError("")

        try {
            const response = await CustomFetch(`${url}/users/phone/verify-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: verificationCode }),
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Unable to verify phone number")
            }

            setUserDetails(prev => ({ ...prev, phoneNumberVerified: true }))
            setShowPhoneVerification(false)
            setVerificationCode("")
        } catch (error) {
            setVerificationError(error.message || "Unable to verify phone number")
        } finally {
            setIsVerifyingPhone(false)
        }
    }


    useEffect(()  =>{
        const checkAuth = async () => {
            try {
                const response = await CustomFetch(`${url}/users/info`, {
                    method: "GET",
                    credentials: "include"
                });

                if (!response.ok) {
                    navigate("/login");
                    return;
                }

                const data = await response.json();
                if (data.success) {
                    setUserDetails(data.user);
                    console.log("User data fetched successfully:", data.user);
                } else {
                    navigate("/login");
                }
            } catch(error) {
                console.error("Auth check error:", error);
                navigate("/login");
            }
        };

        checkAuth();
    }, [])


    return(
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-2 sm:px-6 lg:px-8 mb-16">
            <Popup
                message={popup.message}
                type={popup.type}
                onClose={() => setPopup({ message: "", type: "success" })}
            />
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    {/* Cover Photo */}
                    <div className="h-32 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"></div>
                    
                    {/* Profile Info */}
                    <div className="relative px-1 pb-6">
                        {/* Profile Picture */}
                        <div className="flex items-end gap-6">
                            <div className="relative -mt-16">
                                {userDetails?.profilePicture ? (
                                    <div className="relative group">
                                        <img 
                                            src={userDetails.profilePicture} 
                                            alt="Profile" 
                                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-xl flex items-center justify-center">
                                        <FaUserCircle className="text-gray-400 text-6xl" />
                                    </div>
                                )}
                                <label
                                    htmlFor="profile-picture-upload"
                                    title="Change profile picture"
                                    className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-gray-800 text-white shadow-md transition hover:bg-gray-700"
                                >
                                    <FaCamera />
                                    <span className="sr-only">Change profile picture</span>
                                </label>
                                <input
                                    ref={profilePictureInputRef}
                                    id="profile-picture-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                    disabled={isUploadingPicture}
                                    className="hidden"
                                />
                                {isUploadingPicture && <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-gray-500">Uploading...</span>}
                            </div>
                            
                            {/* User Name and Status */}
                            <div className="flex-1 pb-2">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-bold text-gray-800">
                                        {userDetails?.username || "User"}
                                    </h1>
                                </div>
                                <p className="text-gray-500 text-sm mt-1">Member since {new Date().getFullYear()}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <LogoutButton />
                                <button 
                                    onClick={handleEditProfile}
                                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                                        editProfile 
                                            ? 'bg-gray-800 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {editProfile ? 'Editing Mode' : 'Edit Profile'}
                                </button>
                            </div>
                        </div>
                        {profilePictureError && <p className="mt-2 text-center text-sm text-red-600">{profilePictureError}</p>}
                    </div>
                </div>

                {/* Profile Details Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Name Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ProfileField 
                                label="First Name" 
                                icon={<FaUserCircle className="text-gray-400" />}
                                editMode={editProfile}
                                field="fname"
                                value={editProfile ? updateDetails.fname : userDetails?.fname}
                                onChange={handleFieldChange}
                            />
                            
                            <ProfileField 
                                label="Last Name" 
                                icon={<FaUserCircle className="text-gray-400" />}
                                editMode={editProfile}
                                field="lname"
                                value={editProfile ? updateDetails.lname : userDetails?.lname}
                                onChange={handleFieldChange}
                            />
                        </div>

                        {/* Username */}
                        <ProfileField 
                            label="Username" 
                            value={editProfile ? updateDetails.username : userDetails?.username}
                            icon={<FaTag className="text-gray-400" />}
                            editMode={editProfile}
                            field="username"
                            onChange={handleFieldChange}
                        />

                        {/* Email */}
                        <ProfileField 
                            label="Email Address" 
                            value={editProfile ? updateDetails.email : userDetails?.email}
                            icon={<FaEnvelope className="text-gray-400" />}
                            editMode={editProfile}
                            type="email"
                            verified={userDetails?.emailVerified}
                            canEdit={!userDetails?.emailVerified}
                            onVerify={isSendingEmail ? undefined : handleResendEmailVerification}
                            field="email"
                            onChange={handleFieldChange}
                        />

                        {/* Phone Number */}
                        <ProfileField
                            label="Phone Number"
                            value={editProfile ? updateDetails.phoneNumber : userDetails?.phoneNumber}
                            icon={<FaPhone className="text-gray-400" />}
                            editMode={editProfile}
                            verified={userDetails?.phoneNumberVerified}
                            onVerify={isSendingCode ? undefined : handleStartPhoneVerification}
                            field="phoneNumber"
                            onChange={handleFieldChange}
                        />

                        {/* Status */}
                        <ProfileField 
                            label="Account Type" 
                            value={userDetails?.role === "user" ? "Customer" : userDetails?.role === "admin" ? "Administrator" : "Vendor"}
                            icon={<FaTag className="text-gray-400" />}
                            editMode={editProfile}
                            canEdit = {false}
                        />

                        {/* Identification */}
                        {userDetails?.meansOfIdentification && (
                            <ProfileField 
                                label={`${userDetails.meansOfIdentification} Number`}
                                value={userDetails?.identificationNumber}
                                icon={<FaIdCard className="text-gray-400" />}
                                editMode={editProfile}
                            />
                        )}

                        {/* Shipping Address */}
                        {userDetails?.shippingAddress && (
                            editProfile ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <ProfileField
                                        label="Shipping Address"
                                        value={updateDetails.shippingAddress}
                                        icon={<FaMapMarkerAlt className="text-gray-400" />}
                                        editMode={editProfile}
                                        field="shippingAddress"
                                        onChange={handleFieldChange}
                                    />
                                    <ProfileField
                                        label="City"
                                        value={updateDetails.city}
                                        icon={<FaMapMarkerAlt className="text-gray-400" />}
                                        editMode={editProfile}
                                        field="city"
                                        onChange={handleFieldChange}
                                    />
                                    <ProfileField
                                        label="State"
                                        value={updateDetails.state}
                                        icon={<FaMapMarkerAlt className="text-gray-400" />}
                                        editMode={editProfile}
                                        field="state"
                                        onChange={handleFieldChange}
                                    />
                                </div>
                            ) : (
                                <ProfileField
                                    label="Shipping Address"
                                    value={userDetails.shippingAddress + ", " + userDetails.city + ", " + userDetails.state}
                                    icon={<FaMapMarkerAlt className="text-gray-400" />}
                                    editMode={editProfile}
                                />
                            )
                        )}
                    </div>

                    {/* Action Buttons when in edit mode */}
                    {editProfile && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            {updateError && <p className="mr-auto self-center text-sm text-red-600">{updateError}</p>}
                            <button 
                                onClick={() => {
                                    setEditProfile(false)
                                    setUpdateError("")
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50" onClick={handleUpdateUser} disabled={isUpdating}>
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <StatCard label="Orders" value="0" />
                    <StatCard label="Wishlist" value="0" />
                    <StatCard label="Reviews" value="0" />
                    <StatCard label="Points" value="0" />
                </div>

                {(verificationNotice || verificationError) && (
                    <p className={`mt-4 text-center text-sm ${verificationError ? "text-red-600" : "text-green-600"}`}>
                        {verificationError || verificationNotice}
                    </p>
                )}

                {showPhoneVerification && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                            <h2 className="text-lg font-semibold text-gray-800">Verify phone number</h2>
                            <p className="mt-2 text-sm text-gray-500">Enter the six-digit code sent to your phone.</p>
                            {verificationNotice && <p className="mt-2 text-sm text-green-600">{verificationNotice}</p>}
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={verificationCode}
                                onChange={event => setVerificationCode(event.target.value.replace(/\D/g, ""))}
                                className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 outline-none focus:border-gray-800"
                                placeholder="000000"
                            />
                            {verificationError && <p className="mt-2 text-sm text-red-600">{verificationError}</p>}
                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPhoneVerification(false)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleVerifyPhone}
                                    disabled={isVerifyingPhone || verificationCode.length !== 6}
                                    className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white disabled:opacity-50"
                                >
                                    {isVerifyingPhone ? "Verifying..." : "Verify"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Reusable Profile Field Component
const ProfileField = ({ label, value, icon, editMode, type = "text", verified, canEdit = true, field, onChange, onVerify }) => (
    <div className="group relative bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    {icon}
                    {label}
                </div>
                
                {editMode && canEdit ? (
                    <div className="flex items-center gap-3">
                        <input 
                            type={type}
                            value={value || ''}
                            onChange={event => onChange?.(field, event.target.value)}
                            placeholder={`Enter ${label.toLowerCase()}`}
                            className="min-w-0 flex-1 bg-transparent border-b-2 border-gray-200 focus:border-gray-800 outline-none py-1 text-gray-800 font-medium"
                        />
                        {field !== "email" && field !== "phoneNumber" && (
                            <VerificationStatus verified={verified} />
                        )}
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-gray-800 font-medium">
                            {value || 'Not provided'}
                        </p>
                        <VerificationStatus verified={verified} onVerify={onVerify} />
                    </div>
                )}
            </div>
            
            {editMode && canEdit && (
                <CiEdit className="text-gray-400 group-hover:text-gray-600 transition-colors ml-2" />
            )}
        </div>
    </div>
);

const VerificationStatus = ({ verified, onVerify }) => verified !== undefined ? (
    verified ? (
    <span className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-green-600">
        <MdVerified />
        Verified
    </span>
) : (
    <button
        type="button"
        onClick={onVerify}
        disabled={!onVerify}
        className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
    >
        <MdVerified />
        Not verified (click to verify)
    </button>
)
) : null;

// Stat Card Component
const StatCard = ({ label, value }) => (
    <div className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
);

export default ProfilePage;