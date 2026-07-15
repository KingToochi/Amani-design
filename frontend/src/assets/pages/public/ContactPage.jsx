import { Mail, MapPin, Phone } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 pb-24 text-gray-700">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-600">Contact us</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900 sm:text-4xl">We are here to help</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Reach out for order support, styling advice, or partnership questions.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Send us a message</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="h-5 w-5 text-amber-600" />
                <span>support@amanisky.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="h-5 w-5 text-amber-600" />
                <span>+234 800 000 0000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="h-5 w-5 text-amber-600" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gray-900 p-8 text-white shadow-sm">
            <h2 className="text-xl font-semibold">Need help with an order?</h2>
            <p className="mt-3 text-sm leading-7 text-gray-300">
              Our team can help you with tracking, shipping updates, and return questions.
            </p>
            <a
              href="mailto:support@amanisky.com"
              className="mt-6 inline-flex rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-500"
            >
              Email support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
