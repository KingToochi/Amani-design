import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { BASE_URL } from "../../Url";
import { TbCurrencyNaira } from "react-icons/tb";
import { matchesCategory } from "../../utils/categoryMatcher";

const categoryConfig = {
  men: {
    title: "Men's Collection",
    description: "Bold essentials and refined staples for every occasion.",
    categoryKey: "men"
  },
  women: {
    title: "Women's Collection",
    description: "Elegant pieces designed to stand out with confidence.",
    categoryKey: "women"
  },
  accessories: {
    title: "Accessories",
    description: "The finishing touches that complete your signature look.",
    categoryKey: "accessories"
  },
  "new-arrivals": {
    title: "New Arrivals",
    description: "Freshly added favorites for the latest season.",
    categoryKey: "all"
  }
};

const CollectionPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [products, setProducts] = useState(location.state?.categoryProducts || []);
  const [loading, setLoading] = useState(!location.state?.categoryProducts);

  const pageConfig = categoryConfig[slug] || categoryConfig["new-arrivals"];

  useEffect(() => {
    const loadProducts = async () => {
      if (location.state?.categoryProducts?.length) {
        setProducts(location.state.categoryProducts);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/products`);
        const data = await response.json();
        const allProducts = Array.isArray(data) ? data : data.products || [];

        const filtered = slug === "new-arrivals"
          ? [...allProducts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 12)
          : allProducts.filter((product) => matchesCategory(product, pageConfig.categoryKey));

        setProducts(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [location.state, slug]);

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16 text-center text-gray-600">
        Loading collection...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24 text-gray-700">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-600">Curated picks</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900 sm:text-4xl">{pageConfig.title}</h1>
          <p className="mt-4 max-w-2xl text-base text-gray-600">{pageConfig.description}</p>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            No products are available in this collection yet. Please check back soon.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product) => (
              <div key={product._id} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <Link to={`/product-details/${product._id}`}>
                  <img
                    src={product.productImages?.[0] || "https://placehold.co/600x800?text=AmaniSky"}
                    alt={product.productName}
                    className="h-72 w-full object-cover"
                  />
                </Link>
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{product.productName}</h2>
                      <p className="text-sm text-gray-500">{product.productCategory}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <TbCurrencyNaira />
                      <span>{product.basePrice}</span>
                    </div>
                  </div>
                  <p className="line-clamp-3 text-sm text-gray-500">{product.productDescription}</p>
                  <Link
                    to={`/product-details/${product._id}`}
                    className="inline-flex items-center text-sm font-semibold text-amber-600 hover:text-amber-700"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;
