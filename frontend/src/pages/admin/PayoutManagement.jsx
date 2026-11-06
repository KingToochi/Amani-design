import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/useFetch";
import AdminAccessCodeForm from "../../components/common/AdminAccessCodeForm";

const MAX_DISPLAY_ROWS = 10;

const formatCurrency = (amount, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const getReceiptTime = (order) =>
  order.receiptDetails?.receivedAt || order.manualReviewAt || null;

const isEligibleForPayment = (order, now) => {
  const receivedAt = getReceiptTime(order);
  const receivedTimestamp = receivedAt ? new Date(receivedAt).getTime() : NaN;
  return Number.isFinite(receivedTimestamp) && now - receivedTimestamp >= 24 * 60 * 60 * 1000;
};

const flattenVendorOrders = (vendors) =>
  (vendors || []).flatMap((vendor) =>
    (vendor.orders || []).map((order) => ({ vendor, order }))
  );

const PayoutManagement = () => {
  const [vendorsDueForPayout, setVendorsDueForPayout] = useState([]);
  const [vendorsForManualReview, setVendorsForManualReview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessCodePayout, setAccessCodePayout] = useState(null);
  const [accessCodeError, setAccessCodeError] = useState("");
  const [accessCodeSuccess, setAccessCodeSuccess] = useState("");
  const [submittingAccessCode, setSubmittingAccessCode] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [showAllPayoutRows, setShowAllPayoutRows] = useState(false);
  const [showAllReviewRows, setShowAllReviewRows] = useState(false);
  const url = `${BASE_URL}/admin/vendorPayout`;

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await CustomFetch(url, { method: "GET" });
      const data = response ? await response.json() : null;

      if (!response?.ok || !data?.success) {
        setError(data?.message || "Unable to load vendor payouts.");
        setVendorsDueForPayout([]);
        setVendorsForManualReview([]);
        return;
      }

      setVendorsDueForPayout(data.vendorsDueForPayout || []);
      setVendorsForManualReview(data.vendorsForManualReview || []);
    } catch (fetchError) {
      console.error("Error fetching vendor payouts:", fetchError);
      setError("Unable to load vendor payouts.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleAccessCodeSubmit = async (adminAccessCode) => {
    setSubmittingAccessCode(true);
    setAccessCodeError("");
    setAccessCodeSuccess("");

    try {
      const response = await CustomFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminAccessCode,
          vendorId: accessCodePayout.vendor._id,
          amount: Number(accessCodePayout.order.price) * Number(accessCodePayout.order.quantity),
        }),
      });
      const data = response ? await response.json() : null;

      if (!response?.ok || !data?.success) {
        setAccessCodeError(data?.message || "Unable to verify the admin access code.");
        return;
      }

      setAccessCodeSuccess(
        `Access code verified for ${accessCodePayout?.vendor?.name || "this payout"}. ` +
          "The payout request was sent to the server; no bank transfer has been initiated."
      );
    } catch (submitError) {
      console.error("Error verifying payout access code:", submitError);
      setAccessCodeError("Unable to verify the admin access code.");
    } finally {
      setSubmittingAccessCode(false);
    }
  };

  const reviewRows = flattenVendorOrders(vendorsForManualReview);
  const payoutRows = flattenVendorOrders(vendorsDueForPayout);
  const displayedPayoutRows = showAllPayoutRows
    ? payoutRows
    : payoutRows.slice(0, MAX_DISPLAY_ROWS);
  const displayedReviewRows = showAllReviewRows
    ? reviewRows
    : reviewRows.slice(0, MAX_DISPLAY_ROWS);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <h1 className="text-3xl font-semibold text-slate-900">Payout management</h1>
          <p className="mt-2 text-sm text-slate-500">
            Review vendor orders awaiting confirmation and manage payouts eligible for payment.
          </p>
        </header>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            Loading vendor payouts...
          </div>
        ) : (
          <>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-semibold text-slate-900">Vendors due for payout</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pay Now appears after 24 hours have passed since the item was received or manually approved.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Vendor</th>
                      <th className="px-6 py-3 font-medium">Order</th>
                      <th className="px-6 py-3 font-medium">Product</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Received</th>
                      <th className="px-6 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedPayoutRows.map(({ vendor, order }) => {
                      const receiptTime = getReceiptTime(order);
                      const eligible = isEligibleForPayment(order, now);

                      return (
                        <tr key={`${order.orderId}-${order.itemId}`}>
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                            {vendor.name || "Vendor"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {order.orderNumber || order.orderId}
                          </td>
                          <td className="px-6 py-4 text-slate-600">{order.productName || "Order item"}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {formatCurrency(order.price * order.quantity)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {receiptTime ? new Date(receiptTime).toLocaleString() : "Not recorded"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {eligible ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setAccessCodePayout({ vendor, order });
                                  setAccessCodeError("");
                                  setAccessCodeSuccess("");
                                }}
                                className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
                              >
                                Pay Now
                              </button>
                            ) : (
                              <span className="text-slate-500">
                                {receiptTime ? "24-hour hold" : "Receipt time unavailable"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {payoutRows.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                          No vendors are currently due for payout.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {payoutRows.length > MAX_DISPLAY_ROWS && (
                <div className="border-t border-slate-200 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setShowAllPayoutRows((showAll) => !showAll)}
                    className="text-sm font-medium text-indigo-700 hover:text-indigo-900"
                  >
                    {showAllPayoutRows ? "See less" : `See more (${payoutRows.length - MAX_DISPLAY_ROWS} more)`}
                  </button>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-semibold text-slate-900">Awaiting manual review</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review each shipped order before approving or declining it.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Vendor</th>
                      <th className="px-6 py-3 font-medium">Order</th>
                      <th className="px-6 py-3 font-medium">Product</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedReviewRows.map(({ vendor, order }) => (
                      <tr key={`${order.orderId}-${order.itemId}`}>
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                          {vendor.name || "Vendor"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {order.orderNumber || order.orderId}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{order.productName || "Order item"}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {formatCurrency(order.price * order.quantity)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Link
                            to={`/admin/payouts/review/${vendor._id}/${order.orderId}/${order.itemId}`}
                            className="inline-flex rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
                          >
                            View &amp; review
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {reviewRows.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                          No vendors are awaiting manual review.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {reviewRows.length > MAX_DISPLAY_ROWS && (
                <div className="border-t border-slate-200 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setShowAllReviewRows((showAll) => !showAll)}
                    className="text-sm font-medium text-indigo-700 hover:text-indigo-900"
                  >
                    {showAllReviewRows ? "See less" : `See more (${reviewRows.length - MAX_DISPLAY_ROWS} more)`}
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {accessCodePayout && (
        <AdminAccessCodeForm
          title={`Pay ${accessCodePayout.vendor.name || "vendor"}`}
          error={accessCodeError}
          success={accessCodeSuccess}
          loading={submittingAccessCode}
          onSubmit={handleAccessCodeSubmit}
          onCancel={() => {
            setAccessCodePayout(null);
            setAccessCodeError("");
            setAccessCodeSuccess("");
          }}
        />
      )}
    </main>
  );
};

export default PayoutManagement;
