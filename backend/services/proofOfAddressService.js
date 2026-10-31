import { extractTextFromImage } from "./ocrService.js";
import { detectDocumentType } from "./documentTypeService.js";
import { extractDocumentDetails } from "./documentExtractionService.js";
import { verifyDocumentDate } from "./verifyDocumentDate.js";
import { compareAddresses } from "./addressService.js";

export const verifyProofOfAddress = async (
  imageBuffer,
  userAddress
) => {
  // STEP 1: Extract text from the uploaded image
  const ocrResult = await extractTextFromImage(imageBuffer);

  const { text, confidence } = ocrResult;
  console.log("OCR TEXT:", text);

  // STEP 2: Check OCR confidence
  if (confidence < 50) {
    return {
      status: "rejected",
      message: "Image quality is too poor. Please upload a clearer document.",
      confidence
    };
  }

  // STEP 3: Identify the document type
  const typeResult = detectDocumentType(text);

  if (typeResult.status !== "identified") {
    return {
      status: "manual_review",
      message: "Document type could not be identified.",
      confidence
    };
  }

  const documentType = typeResult.documentType;

  // STEP 4: Extract document information
  const documentDetails = extractDocumentDetails(text);

  // STEP 5: Verify the document date
  // Electricity and water bills use the utility bill date rules.
  const dateType = ["electricityBill", "waterBill"].includes(documentType)
    ? "utilityBill"
    : documentType;

  // Tenancy agreements need a separate validity check.
  if (documentType === "tenancyAgreement") {
    return {
      status: "manual_review",
      message: "Tenancy agreement requires a separate validity check.",
      documentType,
      confidence,
      documentDetails
    };
  }

  const dateResult = verifyDocumentDate(text, dateType);

  if (dateResult.status !== "passed") {
    return {
      status: dateResult.status,
      message: dateResult.message,
      documentType,
      confidence,
      documentDate: dateResult.documentDate
    };
  }

  // STEP 6: Compare the document address with the user's address
  const addressResult = compareAddresses(
    documentDetails.address,
    userAddress
  );

  if (addressResult.status !== "matched") {
    return {
      status: "manual_review",
      message: addressResult.message,
      documentType,
      confidence,
      documentDate: dateResult.documentDate,
      documentAddress: documentDetails.address
    };
  }

  // STEP 7: Return the consolidated result
  return {
    status: "passed",
    message: "Preliminary proof-of-address checks passed.",
    documentType,
    confidence,
    documentDate: dateResult.documentDate,
    documentAddress: documentDetails.address,
    customerName: documentDetails.customerName
  };
};