import { useEffect, useState } from "react"
import { BASE_URL } from "../../Url"
import CustomFetch from "../../hooks/UseFetch"

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  shipped: "bg-sky-100 text-sky-700",
  processing: "bg-violet-100 text-violet-700",
  unknown: "bg-slate-100 text-slate-700",
}

const formatDate = (dateString) => {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const Orders = () => {
  const [totalOrder, setTotalOrder] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const url = `${BASE_URL}/orders`

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await CustomFetch(url, {
          method: "GET",
        })

        if (!response) {
          setError("Unable to fetch orders")
          return
        }

        const data = await response.json()

        if (!response.ok) {
          setError(data.message || "Unable to fetch orders")
          setTotalOrder([])
          return
        }

        setTotalOrder(data.totalOrder || [])
      } catch (fetchError) {
        console.error(fetchError)
        setError("Unable to load orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [url])

  const orderSummary = totalOrder.reduce(
    (summary, group) => {
      const status = group._id ? group._id.toString().toLowerCase() : "unknown"
      summary.total += group.count
      summary.byStatus[status] = group.count
      summary.revenue += (group.orders || []).reduce(
        (sum, order) => sum + (Number(order.amount) || 0),
        0
      )
      summary.groups.push({ status, ...group })
      return summary
    },
    { total: 0, revenue: 0, byStatus: {}, groups: [] }
  )

  const totalOrders = orderSummary.total
  const pendingOrders = orderSummary.byStatus.pending || 0
  const deliveredOrders = orderSummary.byStatus.delivered || 0
  const otherOrders = totalOrders - pendingOrders - deliveredOrders

  const getBadgeClasses = (status) => {
    const normalized = status?.toString()?.toLowerCase() || "unknown"
    return statusColors[normalized] || statusColors.unknown
  }

  const getItemCount = (order) => {
    if (Array.isArray(order.items)) return order.items.length
    if (Array.isArray(order.products)) {
      return order.products.reduce(
        (sum, item) => sum + (Number(item.quantity) || 1),
        0
      )
    }
    return "-"
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-slate-900">Orders</h1>
          <p className="max-w-2xl text-sm text-slate-500">
            Review order volume, status breakdown, and detailed order information.
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
            <p className="text-sm font-medium text-slate-500">Other statuses</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{otherOrders}</p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {Object.entries(orderSummary.byStatus).map(([status, count]) => (
            <div key={status} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{status}</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{count}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Order details</h2>
              <p className="text-sm text-slate-500">
                Each order shows status, payment state, item count, and total amount.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Total revenue</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                NGN {orderSummary.revenue.toLocaleString()}
              </p>
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
              orderSummary.groups.map((group) => (
                <div key={group.status} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-[0.18em]">
                        {group.status}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {group.count} order{group.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${getBadgeClasses(group.status)}`}>
                      {group.status}
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {(group.orders || []).map((order) => (
                      <div key={order._id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-500">Order ID</p>
                            <p className="text-lg font-semibold text-slate-900">{order._id}</p>
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
                            <p className="text-sm text-slate-500">Order amount</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {order.currency || "NGN"} {Number(order.amount || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
                            <span className={`h-2.5 w-2.5 rounded-full ${getBadgeClasses(order.orderStatus || group.status).split(" ")[0]}`} />
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

export default Orders;
