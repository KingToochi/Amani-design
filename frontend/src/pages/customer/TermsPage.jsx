const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 pb-24 text-gray-700">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-600">Terms</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900 sm:text-4xl">Marketplace terms and conditions</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
            These terms explain how AmaniSky Fashion connects buyers with independent vendors. By using the marketplace, you agree to provide accurate information, use the platform responsibly, and follow the order, delivery, payment, and complaint rules below.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">1. Our role</h2>
            <p className="mt-3 leading-7">
              AmaniSky Fashion operates as a marketplace and does not own, manufacture, stock, or directly sell the products listed by vendors. Each vendor is responsible for the accuracy, quality, availability, packaging, and lawful sale of their products.
            </p>
            <p className="mt-3 leading-7">
              Product descriptions, images, colours, sizes, and measurements are supplied by vendors. Buyers should review the available information and contact support when clarification is needed before ordering.
            </p>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">2. Vendor order obligations</h2>
            <p className="mt-3 leading-7">
              Vendors must confirm or decline each order within 24 hours after it is placed. A vendor must only confirm an order when the product, selected specifications, and ordered quantity can be supplied.
            </p>
            <p className="mt-3 leading-7">
              Repeated failure to respond, late fulfilment, inaccurate listings, or avoidable cancellations may lead to warnings, withheld payments, listing removal, suspension, or removal from the marketplace.
            </p>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">3. Delivery and payment release</h2>
            <p className="mt-3 leading-7">
              The buyer is responsible for the delivery cost unless a different arrangement is clearly stated before checkout. The buyer must provide a complete and accurate delivery address and be available to receive the order.
            </p>
            <p className="mt-3 leading-7">
              A vendor is credited after the buyer confirms that the product was delivered and matches the order, and the applicable 24-hour confirmation period has passed. A payment may remain pending while a delivery, quality, or order dispute is being reviewed.
            </p>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">4. Inspection and complaints</h2>
            <p className="mt-3 leading-7">
              Buyers should inspect each product promptly on delivery and report any issue within 24 hours of delivery. A complaint should include the order, affected item, and a clear description of the issue. Photos or other reasonable evidence may be requested.
            </p>
            <p className="mt-3 leading-7">
              Complaints made within this period may place the related vendor payment on hold until the issue is investigated and resolved. Buyers should not use, alter, wash, damage, or dispose of a disputed product unless instructed by AmaniSky support.
            </p>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">5. Responsibility for order issues</h2>
            <p className="mt-3 leading-7">
              If an issue is caused by a vendor, including sending the wrong, damaged, materially misdescribed, or defective product, the vendor must either replace the product and pay the return delivery cost or approve a refund to the buyer, subject to review.
            </p>
            <p className="mt-3 leading-7">
              If an issue is caused by the buyer, including an incorrect size selection, incorrect address, change of mind, failure to receive the order, or damage after delivery, the buyer is responsible for the return delivery cost and any applicable deductions.
            </p>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">6. Fair use and dispute resolution</h2>
            <p className="mt-3 leading-7">
              Buyers and vendors must communicate respectfully and must not submit false complaints, manipulate delivery confirmations, abuse refunds, or provide misleading information. Fraudulent or abusive activity may result in account restrictions and cancellation of pending transactions.
            </p>
            <p className="mt-3 leading-7">
              AmaniSky may request information from the buyer, vendor, delivery provider, or payment processor and may make a reasonable decision based on the available evidence. We may update these terms when the marketplace or applicable requirements change.
            </p>
          </section>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-sm leading-7 text-amber-900">
          <h2 className="text-lg font-semibold">Important notice</h2>
          <p className="mt-2">
            These marketplace terms describe the operating rules between buyers, vendors, and AmaniSky Fashion. They do not remove any rights or protections that apply under relevant consumer, commercial, or data-protection laws. Contact support as soon as possible when an order issue cannot be resolved directly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
