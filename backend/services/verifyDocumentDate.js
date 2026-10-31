import { extractDocumentDate } from "./dateExtractionService.js";
import { checkDocumentDate } from "./dateService.js";

export const verifyDocumentDate = (ocrText, documentType) => {
  // Step 1: Extract the date from the OCR text
  const documentDate = extractDocumentDate(ocrText, documentType);

  // Step 2: Check whether a date was found
  if (!documentDate) {
    return {
      status: "manual_review",
      message: "Could not identify the document date.",
      documentDate: null
    };
  }

  // Step 3: Verify the extracted date
  const dateCheck = checkDocumentDate(documentDate);

  // Step 4: Return the result
  return {
    ...dateCheck,
    documentDate
  };
};