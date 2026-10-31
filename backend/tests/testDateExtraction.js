
import { extractDocumentDate } from "../services/dateExtractionService.js";

const sampleText = `
Successful
Aug 20th, 2026
Provider Enugu Electricity
Account Number 0240125050064
Customer Name UMOKE DANIEL
Service Address 10C NIBO STREET
`;

const result = extractDocumentDate(
  sampleText,
  "utilityBill"
);
console.log(
  "Extracted date:",
  result?.toLocaleDateString("en-GB", {
    timeZone: "Africa/Lagos"
  })
);