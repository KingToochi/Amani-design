import { useState } from "react";
import { BASE_URL } from "../../Url";
import Popup from "../../components/common/Popup";
import { FaArrowLeft, FaEnvelope, FaKey, FaShieldAlt, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

const url = `${BASE_URL}/users/forget_password`;

const submitRecoveryRequest = async (payload) => {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};

export const UseEmailAddress = () => {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email.trim()) {
            Popup({ message: "Please enter your email address", type: "error" });
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            Popup({ message: "Please enter a valid email address", type: "error" });
            return;
        }

        try {
            setIsSubmitting(true);
            await submitRecoveryRequest({ email });
            Popup({
                message: "A verification link has been sent to your email address",
                type: "success"
            });
            setEmail("");
        } catch (error) {
            console.error(error);
            Popup({ message: error.message, type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    Email address
                </label>
                <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                        <FaEnvelope />
                    </span>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        name="email"
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
                {isSubmitting ? "Sending reset link..." : "Send reset link"}
            </button>
        </form>
    );
};

export const UseUsername = () => {
    const [username, setUsername] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!username.trim()) {
            Popup({ message: "Please enter your username", type: "error" });
            return;
        }

        try {
            setIsSubmitting(true);
            await submitRecoveryRequest({ username });
            Popup({
                message: "A verification link has been sent to your email address",
                type: "success"
            });
            setUsername("");
        } catch (error) {
            console.error(error);
            Popup({ message: error.message, type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                    Username
                </label>
                <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                        <FaUser />
                    </span>
                    <input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        name="username"
                        onChange={(event) => setUsername(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
                {isSubmitting ? "Sending reset link..." : "Send reset link"}
            </button>
        </form>
    );
};

const ForgetPassword = () => {
    const [method, setMethod] = useState("email");

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-slate-100 px-4 py-10">
            <div className="w-full max-w-md">
                <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-8">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-lg text-rose-500">
                                <FaShieldAlt />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">Security</p>
                                <h1 className="text-xl font-bold text-slate-900">Forgot password</h1>
                            </div>
                        </div>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                        >
                            <FaArrowLeft className="text-xs" />
                            Back
                        </Link>
                    </div>

                    <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setMethod("email")}
                                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                    method === "email"
                                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                        : "text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                Email
                            </button>
                            <button
                                type="button"
                                onClick={() => setMethod("username")}
                                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                    method === "username"
                                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                        : "text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                Username
                            </button>
                        </div>
                    </div>

                    <div className="mb-5">
                        <p className="text-sm text-slate-600">
                            {method === "email"
                                ? "Enter your email to receive a password reset link."
                                : "Enter your username to recover access to your account."}
                        </p>
                    </div>

                    {method === "email" ? <UseEmailAddress /> : <UseUsername />}

                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600">
                        <FaKey className="text-rose-500" />
                        <span>Need help? Contact support</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;