import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/UseFetch";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ViewVendor = () => {
  const [vendorDetails, setVendorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const url = `${BASE_URL}/viewVendor/${id}`;

  useEffect(() => {
    const fetchVendor = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await CustomFetch(url, { method: "GET" });
        const data = response ? await response.json() : null;
        if (!response || !response.ok) {
          setError(data?.message || "Unable to fetch vendor details");
          setVendorDetails(null);
          return;
        }
        setVendorDetails(data.vendor);
      } catch (err) {
        console.error(err);
        setError("Unable to load vendor details");
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [url]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Vendor details</h1>
            <p className="max-w-2xl text-sm text-slate-500">
              View the full vendor profile, contact details, and subscription status.
            </p>
          </div>
          <Link
            to="/admin/vendors"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Back to vendors
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
            Loading vendor info...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
            {error}
          </div>
        ) : !vendorDetails ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
            Vendor not found.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center text-2xl font-semibold text-slate-500">
                  {vendorDetails.fname?.[0] || vendorDetails.username?.[0] || "V"}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vendor name</p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {`${vendorDetails.fname || ""} ${vendorDetails.lname || ""}`.trim() || vendorDetails.username || "Unnamed vendor"}
                  </h2>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Email</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{vendorDetails.email || "—"}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Phone</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{vendorDetails.phoneNumber || "—"}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Vendor type</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{vendorDetails.typeOfVendor || "N/A"}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{vendorDetails.status || "pending"}</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Address</h3>
                  <p className="mt-3 text-sm text-slate-700">
                    {vendorDetails.houseNumber || ""} {vendorDetails.streetName || ""}
                    {vendorDetails.city ? `, ${vendorDetails.city}` : ""}
                    {vendorDetails.state ? `, ${vendorDetails.state}` : ""}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Bank</h3>
                  <p className="mt-3 text-sm text-slate-700">{vendorDetails.bankName || "—"}</p>
                  <p className="text-sm text-slate-700">Account: {vendorDetails.accountNumber || "—"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Subscription</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Subscriber</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{vendorDetails.subscriber ? "Yes" : "No"}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Plan</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{vendorDetails.subscriptionDetails?.plan || "none"}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Subscription status</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{vendorDetails.subscriptionDetails?.status || "inactive"}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Joined</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{formatDate(vendorDetails.joinedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Identity</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <p>Proof of address: {vendorDetails.proofOfAddress || "Not provided"}</p>
                  <p>ID number: {vendorDetails.identificationNumber || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewVendor;