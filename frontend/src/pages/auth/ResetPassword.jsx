import { useEffect, useState } from "react";
import { BASE_URL } from "../../Url";
import Popup from "../../components/common/Popup";
import { FaArrowLeft, FaCheckCircle, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const getPasswordStrength = (value) => {
    if (!value) {
        return { label: "", width: "0%", color: "bg-slate-200" };
    }

    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    if (score <= 2) {
        return { label: "Weak", width: "35%", color: "bg-red-500" };
    }

    if (score <= 4) {
        return { label: "Moderate", width: "70%", color: "bg-amber-500" };
    }

    return { label: "Strong", width: "100%", color: "bg-emerald-500" };
};

const ResetPassword = () => {
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(getPasswordStrength(""));

    const url = `${BASE_URL}/users/reset-password`;
    const verifyUrl = `${BASE_URL}/users/verify-reset-link`;
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const verifyLink = async () => {
        try {
            if (!token) {
                Popup({
                    message: "Invalid reset link",
                    type: "error"
                });
                navigate("/login");
                return;
            }

            const verify = await fetch(verifyUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token })
            });

            const response = await verify.json();

            if (!verify.ok) {
                Popup({
                    message: response.message || "Invalid or expired reset link",
                    type: "error"
                });
                navigate("/login");
                return;
            }

            setLoading(false);
        } catch (error) {
            console.error(error);
            Popup({
                message: "Unable to verify reset link",
                type: "error"
            });
            navigate("/login");
        }
    };

    useEffect(() => {
        verifyLink();
    }, [navigate, token, verifyUrl]);

    const validateData = (event) => {
        const { id, value } = event.target;
        const nextFormData = {
            ...formData,
            [id]: value
        };

        setFormData(nextFormData);

        setError((prev) => {
            const newError = { ...prev };
            delete newError[id];

            if (id === "confirmPassword" && value && nextFormData.password && value !== nextFormData.password) {
                newError.confirmPassword = "Passwords do not match";
            }

            return newError;
        });

        if (id === "password") {
            setPasswordStrength(getPasswordStrength(value));
        }
    };

    const validateForm = () => {
        const newError = {};

        if (!formData.password.trim()) {
            newError.password = "Password is required";
        } else if (formData.password.length < 8) {
            newError.password = "Use at least 8 characters";
        }

        if (!formData.confirmPassword.trim()) {
            newError.confirmPassword = "Please confirm your password";
        } else if (formData.confirmPassword !== formData.password) {
            newError.confirmPassword = "Passwords do not match";
        }

        setError(newError);
        return Object.keys(newError).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);

            const resetPasswordResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token,
                    password: formData.password
                })
            });

            const response = await resetPasswordResponse.json().catch(() => ({}));

            if (!resetPasswordResponse.ok) {
                throw new Error(response.message || "Unable to reset password");
            }

            Popup({
                message: "Password reset successfully",
                type: "success"
            });

            navigate("/login");
        } catch (error) {
            console.error(error);
            Popup({
                message: error.message,
                type: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-2xl text-rose-500">
                        <FaLock />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Security check</p>
                    <h1 className="mt-3 text-2xl font-bold text-slate-900">Verifying your link...</h1>
                    <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full w-1/2 animate-pulse rounded-full bg-rose-500" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-slate-100 px-4 py-10">
            <div className="w-full max-w-md">
                <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-8">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-lg text-rose-500">
                                <FaLock />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">Account</p>
                                <h1 className="text-xl font-bold text-slate-900">Reset password</h1>
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

                    <p className="mb-6 text-sm text-slate-600">
                        Create a new password for your account. Make sure it is secure and memorable.
                    </p>

                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                New password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    placeholder="Enter your new password"
                                    onChange={validateData}
                                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 pr-11 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 ${error.password ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-3 my-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>

                            {formData.password ? (
                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>Password strength</span>
                                        <span className="font-medium text-slate-700">{passwordStrength.label}</span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                            style={{ width: passwordStrength.width }}
                                        />
                                    </div>
                                </div>
                            ) : null}

                            {error.password ? (
                                <p className="text-sm text-red-500">{error.password}</p>
                            ) : (
                                <p className="text-xs text-slate-500">Use at least 8 characters with a mix of letters, numbers, and symbols.</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                                Confirm password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    placeholder="Confirm your password"
                                    onChange={validateData}
                                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 pr-11 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 ${error.confirmPassword ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-3 my-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {error.confirmPassword ? (
                                <p className="text-sm text-red-500">{error.confirmPassword}</p>
                            ) : (
                                <p className="flex items-center gap-2 text-xs text-slate-500">
                                    <FaCheckCircle className="text-emerald-500" />
                                    Both passwords should match exactly.
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {isSubmitting ? "Updating password..." : "Reset password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;