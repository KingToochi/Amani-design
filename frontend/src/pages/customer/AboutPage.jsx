const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 pb-24 text-gray-700">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-600">Our story</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900 sm:text-4xl">AmaniSky brings timeless fashion closer to you</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
            We curate fashion that blends elegance, comfort, and cultural identity. From curated collections to thoughtfully made pieces, every product is selected to help you express your style with confidence.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Crafted with intention",
              copy: "Every collection is chosen to balance everyday wear with elevated design."
            },
            {
              title: "Fast, dependable delivery",
              copy: "We partner with trusted logistics so your order arrives smoothly and on time."
            },
            {
              title: "Built for modern shoppers",
              copy: "The storefront is designed to make browsing, buying, and tracking orders simple."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
