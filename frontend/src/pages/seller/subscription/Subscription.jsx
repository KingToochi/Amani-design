import { useEffect, useMemo, useState } from "react";
import { Check, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { BASE_URL } from "../../../Url";
import CustomFetch from "../../../hooks/useFetch";
import Popup from "../../../components/common/Popup";

const subscriptionPlan = [
    {
        id: "basic",
        name: "Basic",
        price: 2000,
        commission: "10%",
        badge: "Starter",
        description: "Perfect for new sellers testing the market.",
        productLimit: "10 active products",
        features: [
            "1 product image per listing",
            "Basic visibility in search",
            "Simple product management",
            "Marketplace fee: 10% per sale",
        ],
    },
    {
        id: "standard",
        name: "Standard",
        price: 3000,
        commission: "7%",
        badge: "Most popular",
        description: "Built for growing brands that want more reach.",
        productLimit: "10 active products",
        features: [
            "3 product images per listing",
            "Variant options enabled",
            "Boosted visibility",
            "Marketplace fee: 7% per sale",
        ],
    },
    {
        id: "premium",
        name: "Premium",
        price: 5000,
        commission: "5%",
        badge: "Best value",
        description: "For sellers ready to scale fast and maximize sales.",
        productLimit: "Unlimited listings",
        features: [
            "5 product images per listing",
            "Premium placement and discovery",
            "Unlimited product listings",
            "Marketplace fee: 5% per sale",
        ],
    },
];

const formatNaira = (amount) =>
    new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(amount);

const Subscription = () => {
    const [currentSubscriptionPlan, setCurrentSubscriptionPlan] = useState("");
    const [subscriptionExpiryDate, setSubscriptionExpiryDate] = useState("");
    const [subscriptionStartDate, setSubscriptionStartDate] = useState("");
    const [subscriber, setSubscriber] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState("");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await CustomFetch(`${BASE_URL}/users/info`, {
                    method: "GET",
                });

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || "Unable to fetch your details");
                }

                setCurrentSubscriptionPlan(data.user.subscriptionPlan || "basic");
                setSubscriber(Boolean(data.subScriber));
                setSubscriptionExpiryDate(data.user.subscriptionExpiryDate || "");
                setSubscriptionStartDate(data.user.subscriptionStartDate || "");
                setSubscriptionStatus(data.user.subscriptionStatus || "inactive");
                setUser(data.user);
            } catch (error) {
                Popup({
                    message: error.message || "Unable to fetch data",
                    type: "error",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    const activePlan = useMemo(
        () => subscriptionPlan.find((plan) => plan.id === currentSubscriptionPlan?.toLowerCase()),
        [currentSubscriptionPlan]
    );

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_55%)]">
                <div className="rounded-2xl border border-orange-200 bg-white px-8 py-5 shadow-lg shadow-orange-100/50">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Loading</p>
                    <p className="mt-2 text-lg font-medium text-slate-700">Preparing your subscription plans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffaf5,_#f8fafc_38%,_#f1f5f9_100%)] px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-10 text-center">
                    <p className="text-sm font-bold uppercase tracking-[0.28em] text-orange-600">Membership</p>
                    <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                        Choose the plan that fits your business
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
                        Flexible monthly pricing for sellers. Every plan includes clear marketplace fees on each product sold.
                    </p>
                </div>

                <div className="mb-8 grid gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Current plan</p>
                        <p className="mt-2 text-xl font-bold text-slate-900">{activePlan ? activePlan.name : "No active plan"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Subscription status</p>
                        <p className="mt-2 text-xl font-bold capitalize text-slate-900">{subscriptionStatus || "Inactive"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Renewal date</p>
                        <p className="mt-2 text-xl font-bold text-slate-900">
                            {subscriptionExpiryDate ? new Date(subscriptionExpiryDate).toLocaleDateString("en-NG", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            }) : "Not available"}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {subscriptionPlan.map((plan) => {
                        const isCurrentPlan = subscriber && currentSubscriptionPlan?.toLowerCase() === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={[
                                    "relative overflow-hidden rounded-[28px] border p-6 shadow-lg transition-transform duration-200 hover:-translate-y-1",
                                    isCurrentPlan
                                        ? "border-orange-400 bg-gradient-to-b from-orange-50 via-white to-white shadow-orange-200/70"
                                        : "border-slate-200 bg-white shadow-slate-200/70",
                                ].join(" ")}
                            >
                                {isCurrentPlan && (
                                    <div className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">
                                        <Crown className="h-3.5 w-3.5" />
                                        Current plan
                                    </div>
                                )}

                                <div className="mt-8 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">{plan.badge}</p>
                                        <h2 className="mt-3 text-3xl font-black text-slate-900">{plan.name}</h2>
                                    </div>
                                    {plan.id === "standard" && (
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                            Recommended
                                        </span>
                                    )}
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-600">{plan.description}</p>

                                <div className="mt-6 flex items-end gap-2">
                                    <span className="text-4xl font-black text-slate-900">{formatNaira(plan.price)}</span>
                                    <span className="pb-1 text-sm font-medium text-slate-500">/ month</span>
                                </div>

                                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        <span className="text-xs font-bold uppercase tracking-[0.18em]">Marketplace fee</span>
                                    </div>
                                    <p className="mt-3 text-2xl font-bold text-slate-900">{plan.commission}</p>
                                    <p className="mt-1 text-sm text-slate-600">Charged on each product sold.</p>
                                </div>

                                <div className="mt-6 rounded-2xl bg-slate-100/80 p-4">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Sparkles className="h-4 w-4 text-violet-600" />
                                        <span className="text-xs font-bold uppercase tracking-[0.18em]">Included</span>
                                    </div>
                                    <p className="mt-2 text-sm font-medium text-slate-700">{plan.productLimit}</p>
                                </div>

                                <ul className="mt-6 space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                                            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                                <Check className="h-3.5 w-3.5" />
                                            </span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    type="button"
                                    className={[
                                        "mt-8 w-full rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                                        isCurrentPlan
                                            ? "cursor-default bg-slate-900 text-white shadow-md shadow-slate-300"
                                            : "bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.99]",
                                    ].join(" ")}
                                >
                                    {isCurrentPlan ? "Your active plan" : `Choose ${plan.name}`}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {user && (
                    <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Seller summary</p>
                                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                    {user.name || "Seller account"}
                                </h3>
                            </div>
                            <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                                {subscriptionStatus === "active" ? "Account is active" : "Subscription needs attention"}
                            </div>
                        </div>
                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Plan start</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">
                                    {subscriptionStartDate
                                        ? new Date(subscriptionStartDate).toLocaleDateString("en-NG", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })
                                        : "Not available"}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Plan fee</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">
                                    {activePlan ? formatNaira(activePlan.price) : "—"}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Sales commission</p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">
                                    {activePlan ? activePlan.commission : "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subscription;