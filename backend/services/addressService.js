
const abbreviations = {
  st: "street",
  rd: "road",
  ave: "avenue",
  cl: "close",
  cres: "crescent",
  dr: "drive",
  blvd: "boulevard",
  ln: "lane"
};

export const normalizeAddress = (address) => {
  if (!address || typeof address !== "string") {
    return "";
  }

  return address
    .toLowerCase()
    .replace(/[.,#]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(word => abbreviations[word] || word)
    .sort()
    .join(" ");
};

export const compareAddresses = (
  documentAddress,
  userAddress
) => {
  const document = normalizeAddress(documentAddress);
  const user = normalizeAddress(userAddress);

  if (!document || !user) {
    return {
      status: "manual_review",
      message: "One or both addresses are missing."
    };
  }

  if (document === user) {
    return {
      status: "matched",
      message: "Addresses match."
    };
  }

  return {
    status: "manual_review",
    message: "Address differences require manual review."
  };
};
