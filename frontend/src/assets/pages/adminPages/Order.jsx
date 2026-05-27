import { useEffect, useState } from "react";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/UseFetch";

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  returned: "bg-slate-100 text-slate-700",
  processing: "bg-violet-100 text-violet-700",
  unknown: "bg-slate-100 text-slate-700",
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const url = `${BASE_URL}/admin/orders`;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await CustomFetch(url, { method: "GET" });
        const data = response ? await response.json() : null;

        if (!response || !response.ok) {
          setError(data?.message || "Unable to fetch orders");
          setOrders([]);
          return;
        }

        setOrders(data.totalOrder || []);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Unable to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [url]);

  const summary = orders.reduce(
    (acc, group) => {
      const status = group._id ? group._id.toString().toLowerCase() : "unknown";
      acc.total += group.count || 0;
      acc.byStatus[status] = (acc.byStatus[status] || 0) + (group.count || 0);
      acc.revenue += (group.orders || []).reduce(
        (sum, order) => sum + (Number(order.amount) || 0),
        0
      );
      acc.groups.push({ status, ...group });
      return acc;
    },
    { total: 0, revenue: 0, byStatus: {}, groups: [] }
  );

  const totalOrders = summary.total;
  const pendingOrders = summary.byStatus.pending || 0;
  const deliveredOrders = summary.byStatus.delivered || 0;
  const otherOrders = totalOrders - pendingOrders - deliveredOrders;

  const getBadgeClasses = (status) => statusColors[status] || statusColors.unknown;

  const getItemCount = (order) => {
    if (Array.isArray(order.items)) return order.items.length;
    if (Array.isArray(order.products)) {
      return order.products.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-slate-900">Order Management</h1>
          <p className="max-w-2xl text-sm text-slate-500">
            View every order grouped by status and review customer payment details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total orders</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{totalOrders}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Pending</p>
            <p className="mt-4 text-4xl font-bold text-amber-600">{pendingOrders}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Delivered</p>
            <p className="mt-4 text-4xl font-bold text-emerald-600">{deliveredOrders}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Other</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{otherOrders}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Order details</h2>
              <p className="text-sm text-slate-500">
                Inspect each order with customer, payment, and item summary.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Total revenue</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">NGN {summary.revenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {loading ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                Loading orders...
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
                {error}
              </div>
            ) : totalOrders === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                No orders available yet.
              </div>
            ) : (
              summary.groups.map((group) => (
                <div key={group.status} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{group.status}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{group.count} order{group.count !== 1 ? "s" : ""}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${getBadgeClasses(group.status)}`}>
                      {group.status}
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {(group.orders || []).map((order) => (
                      <div key={order._id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="space-y-2">
                            <p className="text-sm text-slate-500">Order</p>
                            <p className="text-lg font-semibold text-slate-900">{order.orderNumber || order._id}</p>
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                              <p className="text-sm text-slate-500">Placed</p>
                              <p className="font-medium text-slate-900">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500">Payment</p>
                              <p className="font-medium text-slate-900">{order.paymentStatus || "Unknown"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500">Items</p>
                              <p className="font-medium text-slate-900">{getItemCount(order)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-slate-500">Amount</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {order.currency || "NGN"} {Number(order.amount || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                            {order.orderStatus || group.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Order;