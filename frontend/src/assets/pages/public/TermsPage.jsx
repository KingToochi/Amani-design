const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 pb-24 text-gray-700">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-600">Terms</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900 sm:text-4xl">Terms of service</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
            By using AmaniSky, you agree to provide accurate information, use the platform responsibly, and respect the intellectual property of designers and vendors listed on the marketplace.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
