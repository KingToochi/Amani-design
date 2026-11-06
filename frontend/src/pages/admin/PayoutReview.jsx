import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/useFetch";

const formatCurrency = (amount, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const PayoutReview = () => {
  const { vendorId, orderId, itemId } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingDecision, setSavingDecision] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchPayoutReview = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await CustomFetch(`${BASE_URL}/admin/vendorPayout`, { method: "GET" });
      const data = response ? await response.json() : null;

      if (!response?.ok || !data?.success) {
        setError(data?.message || "Unable to load payout details.");
        return;
      }

      const matchedVendor = (data.vendorsForManualReview || []).find(
        (entry) => String(entry._id) === String(vendorId)
      );
      const matchedOrder = matchedVendor?.orders?.find(
        (entry) => String(entry.orderId) === String(orderId) && String(entry.itemId) === String(itemId)
      );

      if (!matchedVendor || !matchedOrder) {
        setError("This payout is no longer awaiting manual review.");
        return;
      }

      setVendor(matchedVendor);
      setOrder(matchedOrder);
    } catch (fetchError) {
      console.error("Error fetching payout review:", fetchError);
      setError("Unable to load payout details.");
    } finally {
      setLoading(false);
    }
  }, [itemId, orderId, vendorId]);

  useEffect(() => {
    fetchPayoutReview();
  }, [fetchPayoutReview]);

  const handleDecision = async (decision) => {
    setSavingDecision(true);
    setError("");
    setMessage("");

    try {
      const response = await CustomFetch(
        `${BASE_URL}/admin/vendorPayout/review/${orderId}/${itemId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision }),
        }
      );
      const data = response ? await response.json() : null;

      if (!response?.ok || !data?.success) {
        setError(data?.message || `Unable to ${decision} this payout.`);
        return;
      }

      setMessage(decision === "approve" ? "Payout review approved." : "Payout review declined.");
      window.setTimeout(() => navigate("/admin/payouts"), 900);
    } catch (decisionError) {
      console.error(`Error attempting to ${decision} payout:`, decisionError);
      setError(`Unable to ${decision} this payout.`);
    } finally {
      setSavingDecision(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link to="/admin/payouts" className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
          &larr; Back to payout management
        </Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Review payout</h1>
          <p className="mt-2 text-sm text-slate-500">
            Review the order and delivery details before making a decision.
          </p>

          {loading ? (
            <p className="mt-8 text-slate-600">Loading payout details...</p>
          ) : error && !order ? (
            <p role="alert" className="mt-8 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
          ) : (
            <>
              <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-500">Vendor</dt>
                  <dd className="mt-1 font-medium text-slate-900">{vendor?.name || "Vendor"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Order number</dt>
                  <dd className="mt-1 font-medium text-slate-900">{order?.orderNumber || order?.orderId}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Customer</dt>
                  <dd className="mt-1 font-medium text-slate-900">{order?.customerName || "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Customer email</dt>
                  <dd className="mt-1 font-medium text-slate-900">{order?.customerEmail || "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Product</dt>
                  <dd className="mt-1 font-medium text-slate-900">{order?.productName || "Order item"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Quantity</dt>
                  <dd className="mt-1 font-medium text-slate-900">{order?.quantity || 0}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Order amount</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {formatCurrency(order?.price * order?.quantity)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Delivery status</dt>
                  <dd className="mt-1 font-medium capitalize text-slate-900">
                    {(order?.itemStatus || "unknown").replaceAll("_", " ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Dispatched</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {order?.sentAt ? new Date(order.sentAt).toLocaleString() : "Not recorded"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Customer receipt</dt>
                  <dd className="mt-1 font-medium text-slate-900">Not confirmed</dd>
                </div>
              </dl>

              {error && <p role="alert" className="mt-6 text-sm text-rose-700">{error}</p>}
              {message && <p role="status" className="mt-6 text-sm text-emerald-700">{message}</p>}

              <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
                <button
                  type="button"
                  disabled={savingDecision || Boolean(message)}
                  onClick={() => handleDecision("approve")}
                  className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingDecision ? "Saving..." : "Approve"}
                </button>
                <button
                  type="button"
                  disabled={savingDecision || Boolean(message)}
                  onClick={() => handleDecision("decline")}
                  className="rounded-lg border border-rose-300 px-5 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Decline
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default PayoutReview;
