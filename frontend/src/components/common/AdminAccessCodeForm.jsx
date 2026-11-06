import { useState } from "react";

const AdminAccessCodeForm = ({
  title = "Confirm payout",
  error = "",
  success = "",
  loading = false,
  onSubmit,
  onCancel,
}) => {
  const [adminAccessCode, setAdminAccessCode] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(adminAccessCode);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-access-code-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="admin-access-code-title" className="text-xl font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter your admin access code to continue.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700" htmlFor="admin-access-code">
            Admin access code
          </label>
          <input
            id="admin-access-code"
            type="password"
            autoComplete="current-password"
            required
            value={adminAccessCode}
            onChange={(event) => setAdminAccessCode(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />

          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          {success && <p role="status" className="text-sm text-emerald-700">{success}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading || Boolean(success) || !adminAccessCode.trim()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : success ? "Verified" : "Submit code"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AdminAccessCodeForm;
