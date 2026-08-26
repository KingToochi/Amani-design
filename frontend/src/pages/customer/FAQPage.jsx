const faqs = [
  {
    question: "How do I place an order?",
    answer: "Browse the collection, choose a product, and tap Add to Cart. Once you are ready, proceed to checkout and complete payment."
  },
  {
    question: "Can I track my order?",
    answer: "Yes. After checkout, you can open the Orders page to see the status and update history of your purchase."
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, our MVP supports local delivery with plans to expand to more regions soon."
  },
  {
    question: "Can I create a vendor account?",
    answer: "Yes. Designers and vendors can register and access their dashboard through the registration flow."
  }
];

const FAQPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 pb-24 text-gray-700">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-600">Frequently asked questions</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900 sm:text-4xl">Everything you need to know before you shop</h1>
        </div>

        <div className="space-y-4">
          {faqs.map((item) => (
            <div key={item.question} className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">{item.question}</h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
