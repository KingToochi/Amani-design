import { useEffect, useState } from "react";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/UseFetch";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const url = `${BASE_URL}/admin/products`;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await CustomFetch(url, { method: "GET" });
        const data = response ? await response.json() : null;

        if (!response || !response.ok) {
          setError(data?.message || "Unable to fetch products");
          setProducts([]);
          return;
        }

        setProducts(data.products || []);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Unable to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [url]);

  const handleViewProduct = (id) => {
    // Implement navigation to product details page
    // For example, using React Router:
    navigate(`/admin/products/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-slate-900">Products</h1>
          <p className="max-w-2xl text-sm text-slate-500">
            Review products uploaded to the marketplace and their vendor assignment.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total products</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{products.length}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Product catalog</h2>
              <p className="text-sm text-slate-500">
                Products returned from the admin product endpoint.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Last refresh</p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            {loading ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                Loading products...
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                No products found.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.productName || "Unnamed product"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {product.vendorId || "—"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {product._id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button onClick={() => handleViewProduct(product._id)} className="text-green-700 hover:text-green-900 cursor-pointer">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
