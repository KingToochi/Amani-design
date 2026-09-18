
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const popupStyles = {
    success: {
        icon: CheckCircle2,
        iconClass: "text-emerald-600",
        accentClass: "bg-emerald-500",
        title: "Success",
    },
    error: {
        icon: AlertCircle,
        iconClass: "text-rose-600",
        accentClass: "bg-rose-500",
        title: "Something went wrong",
    },
    info: {
        icon: Info,
        iconClass: "text-blue-600",
        accentClass: "bg-blue-500",
        title: "Notice",
    },
};

const Popup = ({
    message,
    type = "success",
    title,
    onClose,
}) => {
    if (!message) return null;

    const style = popupStyles[type] ?? popupStyles.info;
    const Icon = style.icon;

    return (
        <div
            className="fixed inset-x-4 top-5 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:top-6 sm:justify-end"
            role={type === "error" ? "alert" : "status"}
            aria-live="polite"
        >
            <div className="relative flex w-full max-w-md items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 pr-12 shadow-[0_16px_40px_-18px_rgba(15,23,42,0.45)] ring-1 ring-slate-950/5 animate-in slide-in-from-top-3 fade-in duration-300">
                <span
                    className={`absolute inset-y-0 left-0 w-1 ${style.accentClass}`}
                    aria-hidden="true"
                />

                <span className="mt-0.5 rounded-full bg-slate-50 p-2">
                    <Icon className={style.iconClass} size={20} strokeWidth={2.25} />
                </span>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                        {title || style.title}
                    </p>
                    <p className="mt-1 break-words text-sm leading-5 text-slate-600">
                        {message}
                    </p>
                </div>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close notification"
                        className="absolute right-3 top-3 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Popup;