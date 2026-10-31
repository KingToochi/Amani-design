import { verifyDocumentDate } from "../services/verifyDocumentDate.js";

const sampleOCRText = `
Successful
Aug 20th, 2026
Electricity Provider
Service Address: 10 Example Street
`;

const result = verifyDocumentDate(
  sampleOCRText,
  "utilityBill"
);

console.log("Verification result:", result);

console.log(
  "Document date:",
  result.documentDate?.toLocaleDateString("en-GB", {
    timeZone: "Africa/Lagos"
  })
);