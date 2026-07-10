const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 pb-24 text-gray-700">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-600">Privacy</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900 sm:text-4xl">Your information stays protected</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
            We use your information only to process orders, improve the shopping experience, and provide customer support. We do not share personal data with third parties for marketing purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
