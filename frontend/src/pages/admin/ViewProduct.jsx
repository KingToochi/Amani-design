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

const ViewProduct = () => {
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const url = `${BASE_URL}/viewProduct/${id}`;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await CustomFetch(url, { method: "GET" });
        const data = response ? await response.json() : null;
        if (!response || !response.ok) {
          setError(data?.message || "Unable to fetch product details");
          setProductDetails(null);
          return;
        }
        setProductDetails(data.product);
      } catch (err) {
        console.error(err);
        setError("Unable to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [url]);

  

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Product details</h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Review the selected product with its vendor, pricing, and variants.
            </p>
          </div>
          <Link
            to="/admin/products"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Back to products
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
            Loading product info...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
            {error}
          </div>
        ) : !productDetails ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
            Product not found.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Name</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-900">{productDetails.productName}</h2>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Category</p>
                  <p className="mt-2 text-base font-medium text-slate-900">{productDetails.productCategory} / {productDetails.productSubCategory}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{productDetails.productDescription}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Base price</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">NGN {productDetails.basePrice?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Color / Size</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{productDetails.baseColor || "—"} / {productDetails.baseSize || "—"}</p>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Created</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{formatDate(productDetails.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Vendor</h3>
                <div className="mt-5 space-y-4 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">{productDetails.vendorId?.fname || "Vendor"} {productDetails.vendorId?.lname || ""}</p>
                  <p>{productDetails.vendorId?.email || "No email available"}</p>
                  <p className="text-slate-500">Username: {productDetails.vendorId?.username || "—"}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Images</h3>
                  <p className="text-sm text-slate-500">{(productDetails.productImages || []).length} files</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(productDetails.productImages || []).slice(0, 4).map((src, index) => (
                    <img key={index} src={src} alt={`Product image ${index + 1}`} className="h-28 w-full rounded-3xl object-cover" />
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Variants</h3>
                {(productDetails.variants || []).length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">No variants configured.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {productDetails.variants.map((variant, index) => (
                      <div key={index} className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-900">{variant.color || "Color"} / {variant.size || "Size"}</p>
                        <p className="text-sm text-slate-700">Price: NGN {variant.price?.toLocaleString() || "0"}</p>
                        <p className="text-sm text-slate-700">Stock: {variant.stock ?? 0}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProduct;