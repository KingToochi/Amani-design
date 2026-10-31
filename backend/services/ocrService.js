import {createWorker} from 'tesseract.js';

export const extractTextFromImage = async (imagePath) => {
    const worker = await createWorker("eng");

    try {
        const result = await worker.recognize(imagePath);

        return {
            text : result.data.text,
            confidence: result.data.confidence
        }
    } catch (error) {
        console.error("Error extracting text from image:", error);
        throw error;
    }finally {
        await worker.terminate();
    }
}