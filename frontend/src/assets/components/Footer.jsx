const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerSections = [
    {
      title: "Shop",
      links: ["New Arrivals", "Women's Collection", "Men's Collection", "Accessories", "Sale"]
    },
    {
      title: "Customer Service",
      links: ["Contact Us", "FAQs", "Shipping Info", "Returns & Exchanges", "Size Guide"]
    },
    {
      title: "About AmaniSky",
      links: ["Our Story", "Sustainability", "Careers", "Press", "Blog"]
    }
  ];

  const socialLinks = [
    { name: "Instagram", icon: "📱", url: "#" },
    { name: "Facebook", icon: "📘", url: "#" },
    { name: "Twitter", icon: "🐦", url: "#" },
    { name: "Pinterest", icon: "📌", url: "#" }
  ];

  const paymentMethods = ["Visa", "Mastercard", "PayPal", "Apple Pay", "Google Pay"];

  return (
    <footer className="bg-gray-900 text-gray-300 absolute w-full top-[2200px]
    md:top-[1900px] lg:top-[1400px] xl:top-[1500px]
    ">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section - Newsletter */}
        <div className="mb-12 pb-8 border-b border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-white text-xl font-semibold mb-2">Stay in Style</h3>
              <p className="text-gray-400">Subscribe to get updates on new arrivals and exclusive offers</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                aria-label="Email for newsletter"
              />
              <button className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-r-lg transition duration-300 ease-in-out">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section - Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <h2 className="text-white text-2xl font-bold tracking-tight">AmaniSky</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Elevate your style with our curated collection of fashion-forward pieces. 
              Where luxury meets everyday elegance.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className="w-10 h-10 bg-gray-800 hover:bg-amber-600 rounded-full flex items-center justify-center text-xl transition-colors duration-300"
                  aria-label={`Follow us on ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-white font-semibold uppercase tracking-wider text-sm">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-amber-500 text-sm transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 mt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-gray-400">
              &copy; {currentYear} AmaniSky FashionWorld. All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400 mr-2">We accept:</span>
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-md"
                >
                  {method}
                </span>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex space-x-4 text-sm">
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-amber-600 hover:bg-amber-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        aria-label="Back to top"
      >
        ↑
      </button>
    </footer>
  );
};

export default Footer;