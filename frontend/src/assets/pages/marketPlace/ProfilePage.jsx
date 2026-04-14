import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {AuthContext} from "./hooks/AuthProvider"
import { CiEdit } from "react-icons/ci";
import { FaUserCircle, FaEnvelope, FaTag, FaMapMarkerAlt, FaIdCard } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const ProfilePage = () => {
    const {setAuth} = useContext(AuthContext)
    const [userDetails, setUserDetails] = useState({})
    const [editProfile, setEditProfile] = useState(false)
    const [updateDetails, setUpdateDetails] = useState({})
    const  token = localStorage.getItem("token");

    const navigate = useNavigate()

    const fetchUserData = async() => {
        try{
            let response = await fetch("https://amani-design-backend.onrender.com/users", {
                method: "GET",
                headers: {
                    "Authorization" : `Bearer ${token}`
                }
            })
            let data = await response.json()
            console.log(data)
            setUserDetails(data.user)

        } catch (error) {
            console.lg(error)
        }
    }


    useEffect(()  =>{
        if(!token) {
            navigate("/login")
            return
        }
    
        try {
            const decoded = jwtDecode(token)
            console.log(decoded)
            const currentTime = Date.now() / 1000
            if (decoded.exp < currentTime) {
                alert("Token has expired") 
                localStorage.removeItem("token")
                navigate("/login")
                return
            } if (!decoded._id) {
                navigate("/login")
                return
            } else {
                setAuth({
                    id : decoded.id,
                    email: decoded.email,
                    username: decoded.username,
                    status: decoded.status,
                    exp: decoded.exp,
                    iat: decoded.iat
                })
            }

            fetchUserData()
            } catch(error) {
                console.error("Invalid token:", error)
                localStorage.removeItem("token")
                na}
    }, [])


    return(
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    {/* Cover Photo */}
                    <div className="h-32 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"></div>
                    
                    {/* Profile Info */}
                    <div className="relative px-6 pb-6">
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
                                        <button className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <CiEdit className="text-white text-2xl" />
                                        </button>
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
                                    <h1 className="text-2xl font-bold text-gray-800">
                                        {userDetails?.username || "User"}
                                    </h1>
                                    {userDetails?.status === "designer" && (
                                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                            <MdVerified className="text-amber-500" />
                                            Designer
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-500 text-sm mt-1">Member since {new Date().getFullYear()}</p>
                            </div>
                            
                            {/* Edit Profile Toggle */}
                            <button 
                                onClick={() => setEditProfile(!editProfile)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
                                value={userDetails?.fname}
                                icon={<FaUserCircle className="text-gray-400" />}
                                editMode={editProfile}
                            />
                            
                            <ProfileField 
                                label="Last Name" 
                                value={userDetails?.lname}
                                icon={<FaUserCircle className="text-gray-400" />}
                                editMode={editProfile}
                            />
                        </div>

                        {/* Username */}
                        <ProfileField 
                            label="Username" 
                            value={userDetails?.username}
                            icon={<FaTag className="text-gray-400" />}
                            editMode={editProfile}
                        />

                        {/* Email */}
                        <ProfileField 
                            label="Email Address" 
                            value={userDetails?.email}
                            icon={<FaEnvelope className="text-gray-400" />}
                            editMode={editProfile}
                            type="email"
                        />

                        {/* Status */}
                        <ProfileField 
                            label="Account Type" 
                            value={userDetails?.status}
                            icon={<FaTag className="text-gray-400" />}
                            editMode={editProfile}
                            badge={userDetails?.status === "designer"}
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
                            <ProfileField 
                                label="Shipping Address" 
                                value={userDetails.shippingAddress}
                                icon={<FaMapMarkerAlt className="text-gray-400" />}
                                editMode={editProfile}
                            />
                        )}
                    </div>

                    {/* Action Buttons when in edit mode */}
                    {editProfile && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button 
                                onClick={() => setEditProfile(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                Save Changes
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
const ProfileField = ({ label, value, icon, editMode, type = "text", badge = false }) => (
    <div className="group relative bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    {icon}
                    {label}
                </div>
                
                {editMode ? (
                    <input 
                        type={type}
                        defaultValue={value || ''}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        className="w-full bg-transparent border-b-2 border-gray-200 focus:border-gray-800 outline-none py-1 text-gray-800 font-medium"
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <p className="text-gray-800 font-medium">
                            {value || 'Not provided'}
                        </p>
                        {badge && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full text-xs font-medium">
                                Verified
                            </span>
                        )}
                    </div>
                )}
            </div>
            
            {editMode && (
                <CiEdit className="text-gray-400 group-hover:text-gray-600 transition-colors ml-2" />
            )}
        </div>
    </div>
);

// Stat Card Component
const StatCard = ({ label, value }) => (
    <div className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
);

export default ProfilePage;