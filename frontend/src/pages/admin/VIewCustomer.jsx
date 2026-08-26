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

const ViewCustomer = () => {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const url = `${BASE_URL}/viewCustomer/${id}`;

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await CustomFetch(url, { method: "GET" });
        const data = response ? await response.json() : null;
        if (!response || !response.ok) {
          setError(data?.message || "Unable to fetch customer details");
          setCustomerDetails(null);
          return;
        }
        setCustomerDetails(data.customer);
      } catch (err) {
        console.error(err);
        setError("Unable to load customer details");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [url]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Customer details</h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Review the customer profile, contact details, and account information.
            </p>
          </div>
          <Link
            to="/admin/customers"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Back to customers
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
            Loading customer info...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
            {error}
          </div>
        ) : !customerDetails ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
            Customer not found.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center text-2xl font-semibold text-slate-500">
                  {customerDetails.fname?.[0] || customerDetails.username?.[0] || "C"}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Customer name</p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {`${customerDetails.fname || ""} ${customerDetails.lname || ""}`.trim() || customerDetails.username || "Unnamed customer"}
                  </h2>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Email</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{customerDetails.email || "—"}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Phone</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{customerDetails.phoneNumber || "—"}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Username</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{customerDetails.username || "—"}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Joined</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{formatDate(customerDetails.joinedAt)}</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Address</h3>
                  <p className="mt-3 text-sm text-slate-700">
                    {customerDetails.houseNumber || ""} {customerDetails.streetName || ""}
                    {customerDetails.city ? `, ${customerDetails.city}` : ""}
                    {customerDetails.state ? `, ${customerDetails.state}` : ""}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Shipping address</h3>
                  <p className="mt-3 text-sm text-slate-700">{customerDetails.shippingAddress || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Account status</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Role</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{customerDetails.role || "user"}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{customerDetails.status || "pending"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Identity</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <p>Identification: {customerDetails.identificationNumber || "Not provided"}</p>
                  <p>Proof of address: {customerDetails.proofOfAddress || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewCustomer;