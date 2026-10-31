const documentPatterns = {
  electricityBill: [
    /electricity/i,
    /prepaid meter/i,
    /meter number/i,
    /energy consumption/i,
    /electricity distribution/i,
    /kwh/i
  ],

  waterBill: [
    /water corporation/i,
    /water bill/i,
    /water meter/i,
    /water consumption/i,
    /water supply/i
  ],

  bankStatement: [
    /bank statement/i,
    /statement period/i,
    /account statement/i,
    /opening balance/i,
    /closing balance/i,
    /transaction history/i
  ],

  tenancyAgreement: [
    /tenancy agreement/i,
    /lease agreement/i,
    /landlord/i,
    /tenant/i,
    /rent period/i,
    /term of tenancy/i
  ]
};

export const detectDocumentType = (text) => {
  if (!text || typeof text !== "string") {
    return {
      status: "manual_review",
      documentType: null,
      message: "Document text is missing."
    };
  }

  const scores = {};

  for (const [documentType, patterns] of Object.entries(documentPatterns)) {
    scores[documentType] = patterns.reduce(
      (score, pattern) => score + (pattern.test(text) ? 1 : 0),
      0
    );
  }

  const rankedTypes = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]);

  const [bestType, bestScore] = rankedTypes[0];
  const secondScore = rankedTypes[1][1];

  if (bestScore === 0 || bestScore === secondScore) {
    return {
      status: "manual_review",
      documentType: null,
      scores,
      message: "Document type could not be identified confidently."
    };
  }

  return {
    status: "identified",
    documentType: bestType,
    scores,
    message: "Document type identified."
  };
};