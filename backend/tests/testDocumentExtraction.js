
import { extractDocumentDetails } from "../services/documentExtractionService.js";

const sampleText = `
Provider Enugu Electricity
Account Number 0240125050064
Customer Name UMOKE DANIEL
Service Address 10C NIBO STREET
Purchase Type Prepaid
`;

const result = extractDocumentDetails(sampleText);

console.log(result);
