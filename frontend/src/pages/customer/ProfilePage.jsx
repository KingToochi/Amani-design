import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {AuthContext} from "../../context/AuthContext"
import { CiEdit } from "react-icons/ci";
import { FaUserCircle, FaEnvelope, FaPhone, FaTag, FaMapMarkerAlt, FaIdCard } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/useFetch";
import LogoutButton from "../../components/common/LogoutButton";

const ProfilePage = () => {
    const {setAuth, logout} = useContext(AuthContext)
    const [userDetails, setUserDetails] = useState({})
    const [editProfile, setEditProfile] = useState(false)
    const [updateDetails, setUpdateDetails] = useState({})
    const [updateError, setUpdateError] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)
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
        setUpdateDetails(prev => ({
            ...prev,
            [field]: value
        }))
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
            </div>
        </div>
    )
}

// Reusable Profile Field Component
const ProfileField = ({ label, value, icon, editMode, type = "text", verified, canEdit = true, field, onChange }) => (
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
                        <VerificationStatus verified={verified} />
                    </div>
                )}
            </div>
            
            {editMode && canEdit && (
                <CiEdit className="text-gray-400 group-hover:text-gray-600 transition-colors ml-2" />
            )}
        </div>
    </div>
);

const VerificationStatus = ({ verified }) => verified !== undefined ? (
    verified ? (
    <span className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-green-600">
        <MdVerified />
        Verified
    </span>
) : (
    <button
        type="button"
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