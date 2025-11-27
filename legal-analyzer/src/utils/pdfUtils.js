import { extractText } from 'unpdf';

export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const { text, totalPages } = await extractText(arrayBuffer, {
      mergePages: false // Get array of page texts
    });
    
    // Combine pages with page markers
    let fullText = '';
    if (Array.isArray(text)) {
      text.forEach((pageText, index) => {
        fullText += `\n--- Page ${index + 1} ---\n${pageText}`;
      });
    } else {
      fullText = text;
    }
    
    // Clean the text
    const cleanText = fullText
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return cleanText;
  } catch (error) {
    console.error('PDF Extraction Error:', error);
    throw new Error('Failed to extract text from PDF.');
  }
};