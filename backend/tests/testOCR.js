
import { readFile } from "node:fs/promises";
import { extractTextFromImage } from "../services/ocrService.js";

const testOCR = async () => {
  try {
    // Read the image as a Buffer
    const imageBuffer = await readFile("./proofofaddress.jpeg");

    // Send the image to Tesseract
    const result = await extractTextFromImage(imageBuffer);

    console.log("OCR RESULT:");
    console.log("-------------------------");

    console.log("Extracted text:", result.text);
    console.log("Confidence:", result.confidence);

  } catch (error) {
    console.error("OCR Test Failed:", error);
  }
};

testOCR();
