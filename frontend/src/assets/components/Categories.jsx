import men from "../images/men1.jpg";
import women from "../images/women2.jpg";
import accessories from "../images/image6.jpg";
import { Link } from "react-router-dom";
import Products from "../pages/marketPlace/Products";

const Categories = ({products, loading, error}) => {
    // Filter products by category
    const menProducts = products?.filter(product => 
        product.category?.toLowerCase() === 'men' || 
        product.category?.toLowerCase() === 'men\'s' ||
        product.category?.toLowerCase() === 'mens'
    ) || [];
    
    const womenProducts = products?.filter(product => 
        product.category?.toLowerCase() === 'women' || 
        product.category?.toLowerCase() === 'women\'s' ||
        product.category?.toLowerCase() === 'womens'
    ) || [];
    
    const accessoriesProducts = products?.filter(product => 
        product.category?.toLowerCase() === 'accessories' || 
        product.category?.toLowerCase() === 'accessory' ||
        product.category?.toLowerCase() === 'accessories'
    ) || [];

    const categories = [
        {
            name: "Men",
            image: men,
            link: "/men",
            description: "Bold styles for the modern gentleman",
            count: menProducts.length,
            products: menProducts
        },
        {
            name: "Women",
            image: women,
            link: "/women",
            description: "Elegant pieces for every occasion",
            count: womenProducts.length,
            products: womenProducts
        },
        {
            name: "Accessories",
            image: accessories,
            link: "/accessories",
            description: "Complete your look with our collection",
            count: accessoriesProducts.length,
            products: accessoriesProducts
        }
    ];

    if (loading) return <div>Loading products...</div>
    if (error) return <div>Error: {error}</div>


    return (
        <section className="absolute top-150 py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Shop by Category
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                        Explore our curated collections for men, women, and accessories
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {categories.map((category, index) => (
                        <Link
                            key={category.name}
                            to={{
                                pathname: category.link,
                                state: { 
                                    categoryProducts: category.products,
                                    categoryName: category.name 
                                }
                            }}
                            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 aspect-[4/5]"
                        >
                            {/* Image */}
                            <div className="w-full h-full overflow-hidden">
                                <img
                                    src={category.image}
                                    alt={`${category.name} category`}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                />
                            </div>

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

                            {/* Text Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-0 group-hover:-translate-y-2 transition-transform duration-500">
                                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                                    {category.name}
                                </h3>
                                <p className="text-sm md:text-base text-gray-200 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                    {category.description}
                                </p>
                                <p className="text-sm md:text-base text-gray-200 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                    {category.description}
                                </p>
                                <span className="inline-flex items-center text-amber-400 font-semibold text-sm">
                                    Shop {category.name}
                                    <svg 
                                        className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>

                            {/* Optional: Border effect */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/50 rounded-2xl transition-colors duration-500"></div>
                        </Link>
                    ))}
                </div>

                {/* Optional: View All Button */}
                <div className="text-center mt-12">
                    <Link
                        to="/products"
                        className="inline-flex items-center px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors duration-300"
                    >
                        View All Categories
                        <svg 
                            className="w-5 h-5 ml-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Categories;