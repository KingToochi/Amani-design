import { useForm } from "react-hook-form";
import logo from "../../assets/images/mainLogo.jpg";
import Registration from "./DesignersRegistration";
import { BASE_URL } from "../../Url";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import ServerError from "../../components/common/ServerError";
import { FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";

const Login = () => {
    const url = BASE_URL;
    const [serverError, setServerError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/products";
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const [showRegistrationModal, SetShowRegistrationModal] = useState(false);
    const handlRegistration = () => SetShowRegistrationModal(true);
    const { verifyAndFetchAuth } = useContext(AuthContext);

    const onSubmit = async (data) => {
        setServerError(null);

        try {
            const response = await fetch(`${url}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(data)
            });
            const result = await response.json();

            if (response.ok && result.success) {
                console.log("Login successful:", result);
                const authVerified = await verifyAndFetchAuth();

                if (authVerified) {
                    navigate(from, { replace: true });
                    return;
                }

                throw new Error("Login succeeded, but your session could not be verified. Please try again.");
            }

            throw new Error(result.message || result.error || "Login failed");
        } catch (error) {
            console.error(error);
            setServerError(error);
            setTimeout(() => { setServerError(null); }, 5000);
        }
    };

    const displayShowRegistrationModal = () => {
        return (
            showRegistrationModal && (
                <div className="absolute inset-0 z-40 flex items-start justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm">
                    <div className="relative w-full max-w-3xl rounded-[28px] bg-white px-4 py-5 shadow-2xl sm:px-6 lg:px-8">
                        <div className="mb-6 flex flex-col items-center gap-3">
                            <img className="h-12 w-12 rounded-full object-cover" src={logo} alt="AmaniSky Design logo" />
                            <h1 className="text-center text-2xl font-bold text-slate-900">AmaniSky Design</h1>
                        </div>
                        <h1 className="text-center text-2xl font-semibold text-slate-600">Registration Form</h1>
                        <div className="absolute right-4 top-3">
                            <button
                                type="button"
                                onClick={() => SetShowRegistrationModal(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
                            >
                                x
                            </button>
                        </div>

                        <div className="mt-6 w-full">
                            <Registration />
                        </div>
                    </div>
                </div>
            )
        );
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-slate-100 px-4 py-10">
            <div className="w-full max-w-md">
                <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-8">
                    <div className="mb-6 flex flex-col items-center text-center">
                        <img className="h-16 w-16 rounded-full object-cover shadow-md" src={logo} alt="AmaniSky Design logo" />
                        <h1 className="mt-4 text-2xl font-bold text-slate-900">Welcome back</h1>
                        <p className="mt-2 text-sm text-slate-500">Log in to continue shopping with AmaniSky Design</p>
                    </div>

                    {serverError && <ServerError serverError={serverError} />}

                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                                    <FaEnvelope />
                                </span>
                                <input
                                    id="email"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                                    type="text"
                                    placeholder="Enter your email"
                                    {...register("email", { required: "The email address is required" })}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                                    <FaLock />
                                </span>
                                <input
                                    id="password"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                                    type="password"
                                    placeholder="Enter your password"
                                    {...register("password", { required: "Password is required" })}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-end">
                            <Link
                                to="/forget-password"
                                className="text-sm font-medium text-rose-500 transition hover:text-rose-600"
                            >
                                Forgot your password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {isSubmitting ? "Logging in..." : "Log in"}
                        </button>
                    </form>

                    <div className="mt-6 flex w-full items-center justify-center gap-2 text-sm">
                        <span className="text-slate-600">No account?</span>
                        <Link to="registration" className="font-semibold text-rose-500 transition hover:text-rose-600">
                            Sign up
                        </Link>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                        <span className="text-slate-600">Are you a designer?</span>
                        <button
                            className="inline-flex items-center gap-2 font-semibold text-rose-500 transition hover:text-rose-600"
                            onClick={handlRegistration}
                            type="button"
                        >
                            <FaUserPlus className="text-xs" />
                            Get started here!
                        </button>
                    </div>
                </div>
            </div>

            {displayShowRegistrationModal()}
        </div>
    );
};

export default Login;