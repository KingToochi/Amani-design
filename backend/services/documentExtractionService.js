
const fieldPatterns = {
  customerName: [
    /Customer\s*Name\s*[:\-]?\s*(.+)/i,
    /Account\s*Name\s*[:\-]?\s*(.+)/i,
    /Name\s*[:\-]?\s*(.+)/i,
    /Bill\s*To\s*[:\-]?\s*(.+)/i
  ],

  address: [
    /Residential\s*Address\s*[:\-]?\s*(.+)/i,
    /Service\s*Address\s*[:\-]?\s*(.+)/i,
    /Supply\s*Address\s*[:\-]?\s*(.+)/i,
    /Premises\s*Address\s*[:\-]?\s*(.+)/i,
    /Installation\s*Address\s*[:\-]?\s*(.+)/i,
    /Contact\s*Address\s*[:\-]?\s*(.+)/i,
    /Home\s*Address\s*[:\-]?\s*(.+)/i,
    /Address\s*[:\-]?\s*(.+)/i
  ],

  accountNumber: [
    /Account\s*Number\s*[:\-]?\s*([A-Z0-9\-]+)/i,
    /Account\s*No\.?\s*[:\-]?\s*([A-Z0-9\-]+)/i,
    /Customer\s*ID\s*[:\-]?\s*([A-Z0-9\-]+)/i
  ]
};

const extractField = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
};

export const extractDocumentDetails = (text) => {
  return {
    customerName: extractField(
      text,
      fieldPatterns.customerName
    ),

    address: extractField(
      text,
      fieldPatterns.address
    ),

    accountNumber: extractField(
      text,
      fieldPatterns.accountNumber
    )
  };
};
