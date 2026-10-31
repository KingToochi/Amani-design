import { detectDocumentType } from "../services/documentTypeService.js";

const sampleOCRText = `
Successful
Electricity Distribution Company
Prepaid Meter
Meter Number
Energy Consumption
Service Address
`;

const result = detectDocumentType(sampleOCRText);

console.log("Detection result:", result);