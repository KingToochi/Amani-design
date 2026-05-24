import { useState, useEffect } from "react"
import {BASE_URL} from "../../Url"
import CustomFetch from "../../hooks/UseFetch"

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

const Sales = () => {
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const url = `${BASE_URL}/sales`

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await CustomFetch(url, {
          method: "GET",
        })

        if (!response) {
          setError("Unable to fetch sales")
          return
        }

        const data = await response.json()

        if (!response.ok) {
          setError(data.message || "Unable to fetch sales")
          setSalesData([])
          return
        }

        setSalesData(data.totalSales || [])
      } catch (fetchError) {
        console.error(fetchError)
        setError("Unable to load sales")
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [url])

  const totalProductsSold = salesData.reduce((sum, item) => sum + (Number(item.totalSales) || 0), 0)
  const totalRevenue = salesData.reduce((sum, item) => sum + (Number(item.totalRevenue) || 0), 0)
  const totalProducts = salesData.length

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-slate-900">Sales</h1>
          <p className="max-w-2xl text-sm text-slate-500">
            Track product sales performance, total revenue, and your top-selling items.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Products sold</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{totalProductsSold}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Revenue</p>
            <p className="mt-4 text-4xl font-bold text-emerald-600">₦{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Product count</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{totalProducts}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Average revenue</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">
              ₦{totalProducts ? (totalRevenue / totalProducts).toFixed(0).toLocaleString() : 0}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Sales by product</h2>
              <p className="text-sm text-slate-500">
                View individual product performance and revenue totals.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Updated</p>
              <p className="mt-1 text-sm text-slate-700">{formatDate(new Date().toISOString())}</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 font-medium text-slate-700">Product ID</th>
                  <th className="px-6 py-4 font-medium text-slate-700">Units sold</th>
                  <th className="px-6 py-4 font-medium text-slate-700">Revenue</th>
                  <th className="px-6 py-4 font-medium text-slate-700">Last sale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                      Loading sales...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-rose-600">
                      {error}
                    </td>
                  </tr>
                ) : salesData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                      No sales data available.
                    </td>
                  </tr>
                ) : (
                  salesData.map((item) => (
                    <tr key={item._id || item.productId} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {item._id || item.productId}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{item.totalSales || 0}</td>
                      <td className="px-6 py-4 text-slate-700">₦{Number(item.totalRevenue || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-700">{formatDate(item.createdAt || item.updatedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}





export default Sales;