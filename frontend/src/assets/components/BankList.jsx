import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

const banks = [
  // Commercial banks
  { code: "044", name: "Access Bank" },
  { code: "063", name: "Access Bank (Diamond)" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank (FCMB)" },
  { code: "058", name: "Guaranty Trust Bank (GTBank)" },
  { code: "030", name: "Heritage Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },

  // Other licensed / newer banks
  { code: "090405", name: "Moniepoint Microfinance Bank" },
  { code: "090267", name: "Kuda Microfinance Bank" },
  { code: "090175", name: "Rubies Microfinance Bank" },
  { code: "090115", name: "TCF Microfinance Bank" },
  { code: "090328", name: "Eyowo Microfinance Bank" },
  { code: "090286", name: "Safe Haven Microfinance Bank" },
  { code: "090110", name: "VFD Microfinance Bank" },

  // Non-interest banks
  { code: "301", name: "Jaiz Bank" },
  { code: "090223", name: "Lotus Bank" },
  { code: "090115", name: "TAJBank" },

  // Digital / online-focused financial institutions
  { code: "090267", name: "Kuda Bank" },
  { code: "OPAY", name: "OPay" },
  { code: "PALMPAY", name: "PalmPay" },
  { code: "090405", name: "Moniepoint" },
  { code: "090175", name: "Rubies Bank" },
  { code: "090286", name: "Safe Haven Bank" },
  { code: "090110", name: "VFD Bank" },
];


const BankList = ({ id, value, onChange, formInputValidation, name = id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const containerRef = useRef(null);

  // Sort banks alphabetically
  const sortedBanks = [...banks].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Filter banks based on search
  const filteredBanks = sortedBanks.filter((bank) =>
    bank.name.toLowerCase().includes(query.toLowerCase())
  );

  // Find currently selected bank
  const selectedBank = sortedBanks.find(
    (bank) => bank.name === value
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleBankSelect = (bank) => {
    onChange({
      preventDefault: () => {},
      target: {
        id,
        name,
        value: bank.name,
        type: "text",
      },
    });

    setIsOpen(false);
    setQuery("");
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      {/* Selected bank */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span
          className={
            selectedBank
              ? "text-gray-900"
              : "text-gray-400"
          }
        >
          {selectedBank
            ? selectedBank.name
            : "Select your bank"}
        </span>

        <FaChevronDown
          className={`text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">

          {/* Search */}
          <div className="border-b border-gray-200 p-3">
            <div className="relative">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />

              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search bank..."
                autoFocus
                className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bank list */}
          <div className="max-h-64 overflow-y-auto">

            {filteredBanks.length > 0 ? (
              filteredBanks.map((bank) => (
                <button
                  key={`${bank.code}-${bank.name}`}
                  type="button"
                  role="option"
                  aria-selected={value === bank.name}
                  onClick={() => handleBankSelect(bank)}
                  className={`w-full px-4 py-3 text-left text-sm transition hover:bg-gray-100 ${
                    value === bank.name
                      ? "bg-blue-50 font-medium text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{bank.name}</span>

                    {value === bank.name && (
                      <span className="text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No bank found
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default BankList;