import mammoth from "mammoth";

export async function extractTextFromDOCX(file: File | Buffer): Promise<string> {
  try {
    let arrayBuffer: ArrayBuffer;

    if (file instanceof File) {
      arrayBuffer = await file.arrayBuffer();
    } else {
      // Convert Buffer to ArrayBuffer
      arrayBuffer = file.buffer.slice(
        file.byteOffset,
        file.byteOffset + file.byteLength
      ) as ArrayBuffer;
    }

    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

export async function extractTextFromDOCXUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error) {
    console.error("Error extracting text from DOCX URL:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}
