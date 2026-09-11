import { useEffect, useState } from "react";
import { FiBell, FiPackage, FiArrowRight } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/useFetch";

const Message = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await CustomFetch(`${BASE_URL}/vendor/notifications`);

      if (!response) {
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load notifications");
      }

      setNotifications(result.notifications || []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const intervalId = setInterval(fetchNotifications, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const markNotificationRead = async (notificationId) => {
    if (!notificationId) {
      return;
    }

    try {
      const response = await CustomFetch(`${BASE_URL}/vendor/notifications/${notificationId}/read`, {
        method: "PUT",
      });

      if (!response) {
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update notification");
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Unable to mark notification as read", err);
    }
  };

  const handleOpenOrder = async (notification) => {
    if (!notification?.read) {
      await markNotificationRead(notification._id);
    }

    if (notification?.data?.orderId) {
      navigate(`/vendor/orders/vendor_order/${notification.data.orderId}`);
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-600">
              Vendor inbox
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Messages</h1>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
            <div className="rounded-full bg-violet-100 p-2 text-violet-700">
              <FiBell size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                Unread
              </p>
              <p className="text-xl font-bold text-slate-900">{unreadCount}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            Loading notifications...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            You do not have any notifications yet.
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-2xl border p-5 shadow-sm transition ${
                  notification.read
                    ? "border-slate-200 bg-white"
                    : "border-violet-200 bg-violet-50"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                          notification.read
                            ? "bg-slate-200 text-slate-600"
                            : "bg-violet-600 text-white"
                        }`}
                      >
                        {notification.read ? "Read" : "Unread"}
                      </span>

                      <span className="text-xs text-slate-500">
                        {notification.title || "New Order"}
                      </span>
                    </div>

                    <p className="mt-3 text-lg font-semibold text-slate-900">
                      {notification.message}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(notification.data?.products || []).map((product) => {
                        const productLabel = [product.color, product.size]
                          .filter(Boolean)
                          .join(" / ");

                        const productName = productLabel
                          ? `${product.productName} (${productLabel})`
                          : product.productName;

                        return (
                          <Link
                            key={`${notification._id}-${product.itemId || product.productId}`}
                            to={`/vendor/orders/vendor_order/${notification.data.orderId}`}
                            onClick={() => markNotificationRead(notification._id)}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-violet-700 ring-1 ring-violet-200 transition hover:bg-violet-100"
                          >
                            <FiPackage size={14} />
                            {productName}
                            <FiArrowRight size={14} />
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <button
                      type="button"
                      onClick={() => handleOpenOrder(notification)}
                      className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                    >
                      View order details
                    </button>

                    <span className="text-xs text-slate-500">
                      {new Date(notification.createdAt || notification.sentAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
