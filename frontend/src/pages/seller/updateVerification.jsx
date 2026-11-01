import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle, LoaderCircle, Upload } from "lucide-react";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/useFetch";

const identificationTypes = [
  { value: "NIN", label: "National Identification Number (NIN)" },
  { value: "Voters Card", label: "Voter's Card" },
  { value: "Drivers License", label: "Driver's License" },
  { value: "International Passport", label: "International Passport" },
];
const normalizeIdentificationType = (value) => {
  const legacyValues = {
    nin: "NIN",
    vin: "Voters Card",
    driverslicense: "Drivers License",
    passport: "International Passport",
  };
  const normalized = legacyValues[value?.replace(/\s/g, "").toLowerCase()] || value;
  return identificationTypes.find((type) => type.value === normalized)?.value || "";
};

const inputClassName =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

const UpdateVerification = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [meansOfIdentification, setMeansOfIdentification] = useState("");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [proofOfAddressFile, setProofOfAddressFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  

  useEffect(() => {
    const fetchVendorInfo = async () => {
      try {
        const response = await CustomFetch(`${BASE_URL}/users/info`, { method: "GET" });
        const data = response ? await response.json() : null;

        if (!response?.ok || !data?.success || !data.user) {
          throw new Error(data?.message || "Unable to load your verification details.");
        }
        if (data.user.id !== id) {
          throw new Error("This verification link does not belong to your account.");
        }

        setVendor(data.user);
        setMeansOfIdentification(normalizeIdentificationType(data.user.meansOfIdentification));
        setIdentificationNumber(data.user.identificationNumber || "");
      } catch (fetchError) {
        setError(fetchError.message || "Unable to load your verification details.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorInfo();
  }, [id]);

  const submitProofOfAddress = async (event) => {
    event.preventDefault();
    if (!proofOfAddressFile) {
      setError("Choose an image of your proof of address.");
      return;
    }

    setSubmitting("proofOfAddress");
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("proofOfAddress", proofOfAddressFile);
      const response = await CustomFetch(`${BASE_URL}/users/proof-of-address`, {
        method: "PUT",
        body: formData,
      });
      const data = response ? await response.json() : null;

      if (!response?.ok || !data?.success) {
        throw new Error(data?.message || "Unable to update your proof of address.");
      }

      setVendor((current) => ({
        ...current,
        proofOfAddress: data.proofOfAddress,
        proofOfAddressVerification: data.proofOfAddressVerification,
      }));
      setProofOfAddressFile(null);
      setMessage(data.message || "Proof of address submitted for review.");
    } catch (submitError) {
      setError(submitError.message || "Unable to update your proof of address.");
    } finally {
      setSubmitting("");
    }
  };

  const submitIdentification = async (event) => {
    event.preventDefault();
    setSubmitting("identification");
    setError("");
    setMessage("");

    try {
      const response = await CustomFetch(`${BASE_URL}/users/means-of-identification`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meansOfIdentification,
          identificationNumber: identificationNumber.trim(),
        }),
      });
      const data = response ? await response.json() : null;

      if (!response?.ok || !data?.success) {
        throw new Error(data?.message || "Unable to update your identification details.");
      }

      setVendor((current) => ({
        ...current,
        meansOfIdentification: data.meansOfIdentification,
        identificationNumber: data.identificationNumber,
        identificationVerification: data.identificationVerification,
      }));
      setMessage(data.message || "Identification details submitted for review.");
    } catch (submitError) {
      setError(submitError.message || "Unable to update your identification details.");
    } finally {
      setSubmitting("");
    }
  };

  const VerificationStatus = ({ value }) => {
    const isRejected = value === "rejected";
    const isVerified = value === "verified";
    const label = isRejected ? "Rejected" : isVerified ? "Verified" : "Pending review";

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          isRejected
            ? "bg-rose-100 text-rose-700"
            : isVerified
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-800"
        }`}
      >
        {isVerified ? <CheckCircle size={14} /> : isRejected ? <AlertCircle size={14} /> : null}
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        <LoaderCircle className="animate-spin" />
        <span className="ml-2">Loading verification details...</span>
      </div>
    );
  }

  if (error && !vendor) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          {error}
        </div>
        <Link to="/vendor" className="mt-5 inline-block text-sm font-semibold text-indigo-700 hover:underline">
          Return to seller dashboard
        </Link>
      </main>
    );
  }

  const proofRejected = vendor?.proofOfAddressVerification === "rejected";
  const identificationRejected = vendor?.identificationVerification === "rejected";
  const isAlreadyVerified =
    ["approved", "verified"].includes(vendor?.status?.toLowerCase()) ||
    (vendor?.proofOfAddressVerification === "verified" &&
      vendor?.identificationVerification === "verified");

  if (isAlreadyVerified) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
        <CheckCircle className="h-12 w-12 text-emerald-600" />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Your documents are verified</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your account has already been verified, so no document updates are needed.
        </p>
        <Link
          to="/vendor"
          className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Return to seller dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">Seller account</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Update verification documents</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Replace only the documents that were rejected. Updated documents will be reviewed again.
          </p>
        </header>

        {(error || message) && (
          <div
            role={error ? "alert" : "status"}
            className={`rounded-xl px-4 py-3 text-sm ${
              error ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"
            }`}
          >
            {error || message}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Proof of address</h2>
            <VerificationStatus value={vendor?.proofOfAddressVerification} />
          </div>
          {proofRejected ? (
            <form onSubmit={submitProofOfAddress} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700" htmlFor="proofOfAddress">
                Upload a replacement image
              </label>
              <input
                id="proofOfAddress"
                type="file"
                accept="image/*"
                onChange={(event) => setProofOfAddressFile(event.target.files?.[0] || null)}
                className={`${inputClassName} file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold`}
                required
              />
              {proofOfAddressFile && (
                <p className="text-sm text-slate-500">Selected: {proofOfAddressFile.name}</p>
              )}
              <button
                type="submit"
                disabled={submitting !== ""}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting === "proofOfAddress" ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {submitting === "proofOfAddress" ? "Uploading..." : "Submit proof of address"}
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              {vendor?.proofOfAddressVerification === "verified"
                ? "This document has been verified and does not need updating."
                : "This document is awaiting review. You can update it if it is rejected."}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Means of identification</h2>
            <VerificationStatus value={vendor?.identificationVerification} />
          </div>
          {identificationRejected ? (
            <form onSubmit={submitIdentification} className="mt-5 space-y-4">
              <div>
                <label htmlFor="meansOfIdentification" className="mb-2 block text-sm font-medium text-slate-700">
                  Identification type
                </label>
                <select
                  id="meansOfIdentification"
                  value={meansOfIdentification}
                  onChange={(event) => setMeansOfIdentification(event.target.value)}
                  className={inputClassName}
                  required
                >
                  <option value="" disabled>Select identification type</option>
                  {identificationTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="identificationNumber" className="mb-2 block text-sm font-medium text-slate-700">
                  Identification number
                </label>
                <input
                  id="identificationNumber"
                  type="text"
                  value={identificationNumber}
                  onChange={(event) => setIdentificationNumber(event.target.value)}
                  className={inputClassName}
                  autoComplete="off"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting !== "" || !meansOfIdentification || !identificationNumber.trim()}
                className="rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting === "identification" ? "Submitting..." : "Submit identification details"}
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              {vendor?.identificationVerification === "verified"
                ? "These details have been verified and do not need updating."
                : "These details are awaiting review. You can update them if they are rejected."}
            </p>
          )}
        </section>
      </div>
    </main>
  );
};

export default UpdateVerification;
