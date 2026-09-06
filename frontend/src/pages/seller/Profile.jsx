import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    AtSign,
    BadgeCheck,
    Building2,
    CalendarDays,
    Check,
    CreditCard,
    Edit3,
    LoaderCircle,
    Mail,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
    UserRound,
    X,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import CustomFetch from "../../hooks/useFetch";
import { BASE_URL } from "../../Url";

const emptyForm = {
    fname: "",
    lname: "",
    username: "",
    email: "",
    phoneNumber: "",
    city: "",
    state: "",
    typeOfVendor: "",
};

const formatDate = (value) => {
    if (!value) return "Not set";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Not set"
        : date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

const getInitials = (user) => `${user?.fname?.[0] || ""}${user?.lname?.[0] || ""}`.toUpperCase() || "V";

const Profile = () => {
    const { auth, setAuth, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(auth || {});
    const [form, setForm] = useState(emptyForm);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });

    const loadProfile = async () => {
        try {
            const response = await CustomFetch(`${BASE_URL}/users/info`, { method: "GET" });
            if (!response?.ok) {
                navigate("/login");
                return;
            }

            const data = await response.json();
            console.log(data)
            if (data.success) {
                setUserDetails(data.user);
                setForm({ ...emptyForm, ...data.user });
                setAuth(data.user);
            }
        } catch (error) {
            setFeedback({ type: "error", message: "We could not load your profile." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const subscription = useMemo(() => {
        const status = userDetails.subscriptionStatus || "inactive";
        const isActive = status === "active";
        return {
            status,
            isActive,
            label: isActive ? "Active plan" : status.replace("_", " "),
        };
    }, [userDetails.subscriptionStatus]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);
        setFeedback({ type: "", message: "" });
        try {
            const response = await CustomFetch(`${BASE_URL}/users/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fname: form.fname,
                    lname: form.lname,
                    username: form.username,
                    email: form.email,
                    phoneNumber: form.phoneNumber,
                    city: form.city,
                    state: form.state,
                    typeOfVendor: form.typeOfVendor,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Unable to save changes.");

            const updatedUser = { ...userDetails, ...form };
            setUserDetails(updatedUser);
            setAuth(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setIsEditing(false);
            setFeedback({ type: "success", message: "Profile updated successfully." });
        } catch (error) {
            setFeedback({ type: "error", message: error.message || "Unable to save changes." });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setForm({ ...emptyForm, ...userDetails });
        setIsEditing(false);
        setFeedback({ type: "", message: "" });
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    if (loading) {
        return <div className="flex min-h-[70vh] items-center justify-center text-stone-500"><LoaderCircle className="animate-spin" /></div>;
    }

    return (
        <main className="min-h-screen bg-[#f5f1eb] px-4 py-6 text-stone-900 sm:px-8 lg:px-12 lg:py-10">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-amber-700">Vendor workspace</p>
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your profile</h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">Keep your public details current so customers know who they are buying from.</p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 self-start rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-stone-900 hover:text-stone-900 sm:self-auto">
                        Sign out <ArrowRight size={16} />
                    </button>
                </div>

                <section className="overflow-hidden rounded-[2rem] bg-stone-900 text-white shadow-xl">
                    <div className="relative isolate overflow-hidden px-6 py-8 sm:px-10 sm:py-10">
                        <div className="absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full border-[42px] border-amber-500/30" />
                        <div className="absolute -bottom-40 left-1/3 -z-10 h-80 w-80 rounded-full border-[48px] border-rose-300/10" />
                        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-5">
                                {userDetails.profilePicture ? (
                                    <img src={userDetails.profilePicture} alt="Vendor profile" className="h-24 w-24 rounded-3xl object-cover ring-4 ring-white/10" />
                                ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-400 text-3xl font-bold text-stone-900 ring-4 ring-white/10">{getInitials(userDetails)}</div>
                                )}
                                <div>
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <h2 className="text-2xl font-semibold">{userDetails.fname || userDetails.username || "Vendor"} {userDetails.lname || ""}</h2>
                                        <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-amber-200"><BadgeCheck size={14} /> {userDetails.role || "vendor"}</span>
                                    </div>
                                    <p className="flex items-center gap-2 text-sm text-stone-300"><AtSign size={15} />{userDetails.username || "username"}</p>
                                    <p className="mt-1 flex items-center gap-2 text-sm text-stone-400"><MapPin size={15} />{[userDetails.city, userDetails.state].filter(Boolean).join(", ") || "Location not added"}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsEditing((current) => !current)} className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-stone-900 transition hover:bg-amber-300"><Edit3 size={17} /> {isEditing ? "Close editor" : "Edit profile"}</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
                        <Summary label="Account" value={userDetails.status || "Verified"} />
                        <Summary label="Plan" value={userDetails.subscriptionPlan || "Free"} />
                        <Summary label="Plan status" value={subscription.label} />
                        <Summary label="Renewal" value={formatDate(userDetails.subscriptionExpiryDate)} />
                    </div>
                </section>

                {feedback.message && <div className={`mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${feedback.type === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>{feedback.type === "success" ? <Check size={17} /> : <X size={17} />} {feedback.message}</div>}

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                    <form onSubmit={handleSave} className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-7 flex items-start justify-between gap-4">
                            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Profile details</p><h2 className="mt-1 text-xl font-semibold">Personal information</h2></div>
                            {isEditing && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Editing</span>}
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="First name" name="fname" value={form.fname} onChange={handleChange} disabled={!isEditing} icon={<UserRound size={16} />} />
                            <Field label="Last name" name="lname" value={form.lname} onChange={handleChange} disabled={!isEditing} icon={<UserRound size={16} />} />
                            <Field label="Username" name="username" value={form.username} onChange={handleChange} disabled={!isEditing} icon={<AtSign size={16} />} />
                            <Field label="Email address" name="email" type="email" value={form.email} onChange={handleChange} disabled={!isEditing} icon={<Mail size={16} />} />
                            <Field label="Phone number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} disabled={!isEditing} icon={<Phone size={16} />} />
                            <Field label="Vendor category" name="typeOfVendor" value={form.typeOfVendor} onChange={handleChange} disabled={!isEditing} icon={<Building2 size={16} />} />
                            <Field label="City" name="city" value={form.city} onChange={handleChange} disabled={!isEditing} icon={<MapPin size={16} />} />
                            <Field label="State" name="state" value={form.state} onChange={handleChange} disabled={!isEditing} icon={<MapPin size={16} />} />
                        </div>
                        {isEditing && <div className="mt-8 flex justify-end gap-3 border-t border-stone-100 pt-6"><button type="button" onClick={handleCancel} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-500 hover:bg-stone-100">Cancel</button><button disabled={saving} className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-60">{saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />} Save changes</button></div>}
                    </form>

                    <aside className="space-y-6">
                        <div className="rounded-[1.5rem] bg-amber-400 p-6 text-stone-900 shadow-sm"><div className="mb-8 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-700">Membership</p><h2 className="mt-1 text-2xl font-semibold">{userDetails.subscriptionPlan || "Free plan"}</h2></div><CreditCard size={25} /></div><div className="mb-3 flex items-center justify-between text-sm"><span>Subscription</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${subscription.isActive ? "bg-stone-900 text-amber-300" : "bg-white/50 text-stone-700"}`}>{subscription.status}</span></div><div className="h-2 overflow-hidden rounded-full bg-stone-900/15"><div className={`h-full rounded-full ${subscription.isActive ? "w-full bg-stone-900" : "w-1/3 bg-stone-700"}`} /></div><p className="mt-4 text-xs text-stone-700">Expires {formatDate(userDetails.subscriptionExpiryDate)}</p></div>
                        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-stone-100 p-2.5"><ShieldCheck size={19} className="text-stone-700" /></div><div><h2 className="font-semibold">Account security</h2><p className="text-xs text-stone-500">Your account is protected</p></div></div><div className="flex items-center justify-between border-t border-stone-100 pt-4 text-sm"><span className="text-stone-500">Member since</span><span className="flex items-center gap-1.5 font-semibold"><CalendarDays size={15} /> {formatDate(userDetails.joinedAt) === "Not set" ? "2025" : formatDate(userDetails.joinedAt)}</span></div></div>
                    </aside>
                </div>
            </div>
        </main>
    );
};

const Summary = ({ label, value }) => <div className="border-r border-white/10 px-4 py-4 last:border-r-0 sm:px-6"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">{label}</p><p className="mt-1 truncate text-sm font-semibold capitalize text-stone-100">{value}</p></div>;

const Field = ({ label, icon, ...props }) => <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">{icon}{label}</span><input {...props} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:cursor-default disabled:border-transparent disabled:bg-stone-100/70" /></label>;

export default Profile;