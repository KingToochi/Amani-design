import { Link } from "react-router-dom"

const Search = ({ searchedProduct, setShowSearchedProduct, setShowSearchBar}) => {

    const viewProduct = () => {
      setShowSearchedProduct(false)
      setShowSearchBar(false)
    }
    
    if (searchedProduct.length === 0) {
        return(
            <div className="min-h-[400px] flex flex-col items-center justify-center">
                <div className="text-center">
                    <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h1 className="text-2xl font-semibold text-gray-700 mb-2">No items found</h1>
                    <p className="text-gray-500">Try searching with different keywords</p>
                </div>
            </div>
        )
    }
    
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {searchedProduct?.map(items => (
          <div 
            key={items._id} 
            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <Link 
              onClick={viewProduct}
              to={`/product-details/${items._id}`}
              className="block cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={items.productImage}
                  alt={items.productDescription || "Product image"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    View Details
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h1 className="text-gray-800 font-medium text-sm md:text-base line-clamp-2 mb-2">
                  {items.productDescription || items.name || "Product Description"}
                </h1>
                
                {/* Price if available */}
                {items.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ${items.price}
                    </span>
                    {items.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ${items.originalPrice}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Category Tag if available */}
                {items.category && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {items.category}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      {/* Results Count */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Found {searchedProduct.length} {searchedProduct.length === 1 ? 'product' : 'products'}
      </div>
    </div>
  )
}

export default Search