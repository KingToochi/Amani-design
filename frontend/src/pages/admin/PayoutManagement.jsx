import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/useFetch";

const PAYMENT_HOLD_HOURS = 24;
const PAYMENT_HOLD_MS = PAYMENT_HOLD_HOURS * 60 * 60 * 1000;

const formatDate = (value) => {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString();
};

const formatMoney = (amount, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

const getOrderAmount = (order) =>
  (Number(order.price) || 0) * (Number(order.quantity) || 0);

const splitVendorsByPayoutTiming = (vendors, now) => {
  const readyVendors = [];
  const upcomingVendors = [];

  for (const vendor of vendors) {
    const readyOrders = [];
    const upcomingOrders = [];

    for (const order of vendor.orders) {
      const receivedAt = order.receiptDetails?.receivedAt
        ? new Date(order.receiptDetails.receivedAt).getTime()
        : NaN;
      const canPay = Number.isFinite(receivedAt) && now - receivedAt >= PAYMENT_HOLD_MS;

      (canPay ? readyOrders : upcomingOrders).push(order);
    }

    if (readyOrders.length) readyVendors.push({ ...vendor, orders: readyOrders });
    if (upcomingOrders.length) upcomingVendors.push({ ...vendor, orders: upcomingOrders });
  }

  return { readyVendors, upcomingVendors };
};

const PayoutManagement = () => {
  const [payoutData, setPayoutData] = useState({
    vendorsDueForPayout: [],
    vendorsForManualReview: [],
  });
  const [activeTab, setActiveTab] = useState("ready");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [paymentNotice, setPaymentNotice] = useState("");

  useEffect(() => {
    const fetchPayoutData = async () => {
      try {
        const response = await CustomFetch(`${BASE_URL}/admin/vendorPayout`, {
          method: "GET",
        });
        const data = response ? await response.json() : null;

        if (!response?.ok || !data?.success) {
          setError(data?.message || "Unable to load vendor order details.");
          return;
        }

        setPayoutData({
          vendorsDueForPayout: data.vendorsDueForPayout || [],
          vendorsForManualReview: data.vendorsForManualReview || [],
        });
      } catch (fetchError) {
        console.error("Unable to load vendor payout details:", fetchError);
        setError("Unable to load vendor order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayoutData();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const { readyVendors, upcomingVendors } = splitVendorsByPayoutTiming(
    payoutData.vendorsDueForPayout,
    now
  );
  const vendors = activeTab === "ready"
    ? readyVendors
    : activeTab === "upcoming"
      ? upcomingVendors
      : payoutData.vendorsForManualReview;
  const orderCount = vendors.reduce((total, vendor) => total + vendor.orders.length, 0);
  const payoutTotal = vendors.reduce(
    (total, vendor) =>
      total + vendor.orders.reduce((vendorTotal, order) => vendorTotal + getOrderAmount(order), 0),
    0
  );

  const getVendorTotal = (vendor) =>
    vendor.orders.reduce((total, order) => total + getOrderAmount(order), 0);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="text-3xl font-semibold text-slate-900">Vendor payout management</h1>
          <p className="mt-2 text-sm text-slate-600">
            Delivered order payments become payable 24 hours after the customer confirms receipt.
          </p>
        </header>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("ready")}
            className={`rounded-xl px-5 py-3 text-sm font-semibold ${
              activeTab === "ready"
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            Due for payment ({readyVendors.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`rounded-xl px-5 py-3 text-sm font-semibold ${
              activeTab === "upcoming"
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            Upcoming payment ({upcomingVendors.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("review")}
            className={`rounded-xl px-5 py-3 text-sm font-semibold ${
              activeTab === "review"
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            Manual review ({payoutData.vendorsForManualReview.length})
          </button>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {activeTab === "ready"
                  ? "Payments ready"
                  : activeTab === "upcoming"
                    ? "Upcoming payments"
                    : "Orders awaiting receipt confirmation"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {orderCount} order item{orderCount === 1 ? "" : "s"} across {vendors.length} vendor
                {vendors.length === 1 ? "" : "s"}
              </p>
            </div>
            {activeTab !== "review" && (
              <p className="text-lg font-semibold text-slate-900">
                Total: {formatMoney(payoutTotal)}
              </p>
            )}
          </div>

          {loading ? (
            <p className="rounded-2xl bg-slate-50 p-8 text-center text-slate-600">Loading vendor orders...</p>
          ) : error ? (
            <p role="alert" className="rounded-2xl bg-rose-50 p-5 text-rose-700">{error}</p>
          ) : vendors.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-8 text-center text-slate-600">
              {activeTab === "ready"
                ? "There are no payments past the 24-hour receipt-confirmation hold."
                : activeTab === "upcoming"
                  ? "There are no upcoming payments."
                  : "There are no shipped orders waiting for customer receipt confirmation."}
            </p>
          ) : (
            <div className="space-y-5">
              {vendors.map((vendor) => (
                <article key={vendor._id} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{vendor.name || "Vendor"}</h3>
                      <p className="text-sm text-slate-600">
                        {vendor.email || "No email"}{vendor.phoneNumber ? ` · ${vendor.phoneNumber}` : ""}
                      </p>
                      {activeTab !== "review" && (
                        <p className="mt-2 text-base font-semibold text-slate-900">
                          {activeTab === "ready" ? "Payable" : "Upcoming"}:{" "}
                          {formatMoney(getVendorTotal(vendor))}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeTab === "ready" && (
                        <button
                          type="button"
                          onClick={() =>
                            setPaymentNotice(
                              "No transfer provider is connected yet. Complete the vendor payment using your provider."
                            )
                          }
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          Pay {formatMoney(getVendorTotal(vendor))}
                        </button>
                      )}
                      <Link
                        to={`/admin/viewVendor/${vendor._id}`}
                        className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                      >
                        View vendor
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {vendor.orders.map((order) => (
                      <div
                        key={`${order.orderId}-${order.itemId}`}
                        className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4"
                      >
                        <div>
                          <p className="text-slate-500">Order</p>
                          <p className="font-semibold text-slate-900">{order.orderNumber || order.orderId}</p>
                          <p className="mt-1 text-slate-600">{order.productName} · Qty {order.quantity}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Customer</p>
                          <p className="font-medium text-slate-900">{order.customerName || "Unknown"}</p>
                          <p className="text-slate-600">{order.customerEmail || order.customerPhone || "No contact details"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Order item</p>
                          <p className="font-medium capitalize text-slate-900">
                            {order.itemStatus?.replaceAll("_", " ")}
                          </p>
                          <p className="text-slate-600">Payment: {order.paymentStatus}</p>
                          <p className="text-slate-600">
                            Receipt confirmed: {formatDate(order.receiptDetails?.receivedAt)}
                          </p>
                          {activeTab === "upcoming" && order.receiptDetails?.receivedAt && (
                            <p className="text-amber-700">
                              Payable after {formatDate(
                                new Date(
                                  new Date(order.receiptDetails.receivedAt).getTime() + PAYMENT_HOLD_MS
                                )
                              )}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-slate-500">Item amount</p>
                          <p className="font-medium text-slate-900">
                            {formatMoney(getOrderAmount(order))}
                          </p>
                          <p className="text-slate-600">Placed: {formatDate(order.createdAt)}</p>
                        </div>
                        {activeTab === "review" && (
                          <p className="sm:col-span-2 lg:col-span-4">
                            <span className="font-medium text-amber-800">Manual check:</span>{" "}
                            <span className="text-slate-700">The item is in transit and no customer receipt confirmation is recorded.</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
          {paymentNotice && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p>{paymentNotice}</p>
              <button
                type="button"
                onClick={() => setPaymentNotice("")}
                className="font-semibold underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default PayoutManagement;
