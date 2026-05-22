import { useState, useEffect } from "react"
import CustomFetch from "../../hooks/UseFetch"
import { BASE_URL } from "../../Url"
import ServerError from "../../components/ServerError"

const InfoRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 py-2">
        <div className="text-sm text-gray-500 w-36">{label}</div>
        <div className="text-sm font-medium text-gray-800">{value ?? "—"}</div>
    </div>
)

const SubscriptionCard = ({ subscription }) => {
    const plan = subscription?.plan ?? "Free"
    const status = subscription?.status ?? "inactive"
    const start = subscription?.startDate
    const expiry = subscription?.expiryDate

    return (
        <div className="bg-white shadow rounded-lg p-4 w-full">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-gray-500">Subscription</div>
                    <div className="text-lg font-semibold">{plan}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                    {status}
                </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
                <div>Start: {start ?? '—'}</div>
                <div>Expires: {expiry ?? '—'}</div>
            </div>
        </div>
    )
}

const Profile = () => {
    const [editProfile, setEditProfile] = useState(false)
    const [userData, setUserData] = useState(null)
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [serverError, setServerError] = useState(null)
    const [saving, setSaving] = useState(false)

    const url = `${BASE_URL}/userInfo`
    const updateUrl = `${BASE_URL}/user/update`

    const fetchProfile = async () => {
        try {
            let response = await CustomFetch(url, { method: "GET" })
            const data = await response.json()
            setUserData(data.user)
            setForm({
                fname: data.user?.fname || "",
                lname: data.user?.lname || "",
                email: data.user?.email || "",
                phoneNumber: data.user?.phoneNumber || "",
                shippingAddress: data.user?.shippingAddress || "",
                dob: data.user?.dob || "",
                city: data.user?.city || "",
                state: data.user?.state || "",
                username: data.user?.username || "",
                typeOfVendor: data.user?.typeOfVendor || null
            })
            setLoading(false)
        } catch (error) {
            setServerError({ message: "Failed to fetch user data" })
            setUserData(null)
            setLoading(false)
        }
    }

    useEffect(() => { fetchProfile() }, [])

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

    const updateProfile = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await CustomFetch(updateUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const result = await res.json()
            if (res.ok) {
                console.log("Profile updated successfully")
                setUserData(result.user)
                setEditProfile(false)
            } else {
                setServerError({ message: result.message || 'Failed to update' })
            }
        } catch (error) {
            setServerError(error)
            console.log("Error updating profile:", error)
        } finally {
            setSaving(false)
        }
    }

    if (serverError) return (
        <div className="flex justify-center items-center h-screen">
            <ServerError message={serverError.message} />
        </div>
    )

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-gray-600">Loading profile…</p>
        </div>
    )

    return (
        <div className="w-full p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setEditProfile(prev => !prev)} className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700">
                            {editProfile ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 flex flex-col gap-4">
                        <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center gap-4">
                            <img src={userData?.profilePicture || '/public/default-avatar.png'} alt="profile" className="w-32 h-32 rounded-full object-cover" />
                            <div className="text-center">
                                <div className="text-lg font-semibold">{`${userData?.fname} ${userData?.lname}`}</div>
                                <div className="text-sm text-gray-500">@{userData?.username}</div>
                            </div>
                            <div className="w-full mt-2">
                                <SubscriptionCard subscription={userData?.subscriptionDetails} />
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg p-4">
                            <div className="text-sm text-gray-600">Account status</div>
                            <div className="mt-2 flex items-center gap-2">
                                <div className={`px-3 py-1 rounded-full text-sm ${userData?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                                    {userData?.status}
                                </div>
                                <div className="text-sm text-gray-500">Role: {userData?.typeOfVendor}</div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="mb-4 text-gray-600">Personal information</div>
                            {!editProfile && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoRow label="Full name" value={`${userData?.fname} ${userData?.lname}`} />
                                    <InfoRow label="Username" value={userData?.username} />
                                    <InfoRow label="Email" value={userData?.email} />
                                    <InfoRow label="Phone" value={userData?.phoneNumber} />
                                    <InfoRow label="Date of birth" value={userData?.dob} />
                                    <InfoRow label="Location" value={`${userData?.city ?? ''} ${userData?.state ? ', ' + userData.state : ''}`} />
                                    <InfoRow label="Shipping address" value={userData?.shippingAddress} />
                                </div>
                            )}

                            {editProfile && (
                                <form onSubmit={updateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-600">First name</label>
                                        <input name="fname" value={form.fname} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Last name</label>
                                        <input name="lname" value={form.lname} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Email</label>
                                        <input name="email" value={form.email} onChange={handleChange} type="email" className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Role</label>
                                        <select name="typeOfVendor" value={form.typeOfVendor} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm">
                                            <option value="null hidden">Select Role</option>
                                            <option value="manufacturer">Manufacturer</option>
                                            <option value="wholesaler">Wholesaler</option>
                                            <option value="retailer">Retailer</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Phone</label>
                                        <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="text-sm text-gray-600">Shipping address</label>
                                        <input name="shippingAddress" value={form.shippingAddress} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">City</label>
                                        <input name="city" value={form.city} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">State</label>
                                        <input name="state" value={form.state} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
                                    </div>

                                    <div className="sm:col-span-2 flex items-center gap-3 mt-2 cursor-pointer">
                                        <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                            {saving ? 'Saving…' : 'Save changes'}
                                        </button>
                                        <button type="button" onClick={() => { setEditProfile(false); setForm({ ...form, fname: userData?.fname, lname: userData?.lname }) }} className="px-4 py-2 bg-gray-100 rounded-md">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile