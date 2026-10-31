
const datePatterns = {
  utilityBill: [
    // Dates with labels
    /(?:Issue Date|Date Issued|Billing Date|Bill Date|Date)\s*[:\-]?\s*([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i,

    // Standalone dates, such as Aug 20th, 2026
   /^([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?\s*$/im,

    // Numeric dates: 20/08/2026
    /(?:Issue Date|Date Issued|Billing Date|Bill Date|Date)\s*[:\-]?\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,

    // ISO dates: 2026-08-20
    /(?:Issue Date|Date Issued|Billing Date|Bill Date|Date)\s*[:\-]?\s*(\d{4}-\d{2}-\d{2})/i
  ],

  bankStatement: [
    /(?:Statement Date|Date Issued|Issue Date|Statement Period End)\s*[:\-]?\s*([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i,

    /(?:Statement Date|Date Issued|Issue Date|Statement Period End)\s*[:\-]?\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i,

    /(?:Statement Date|Date Issued|Issue Date|Statement Period End)\s*[:\-]?\s*(\d{4}-\d{2}-\d{2})/i
  ]
};

const parseDate = (value) => {
  const cleaned = value.replace(
    /(\d+)(st|nd|rd|th)/i,
    "$1"
  );

  const numeric = cleaned.match(
    /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/
  );

  if (numeric) {
    const [, day, month, year] = numeric;

    const date = new Date(+year, +month - 1, +day);

    if (
      date.getFullYear() !== +year ||
      date.getMonth() !== +month - 1 ||
      date.getDate() !== +day
    ) {
      return null;
    }

    return date;
  }

  const date = new Date(cleaned);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const extractDocumentDate = (text, documentType) => {
  const patterns = datePatterns[documentType];

  if (!patterns) return null;

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      const date = parseDate(match[1]);

      if (date) return date;
    }
  }

  return null;
};
