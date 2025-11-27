import * as pdfjsLib from 'pdfjs-dist';

// Setting up the worker. 
// In a Vite environment, this often requires copying the worker file to public or importing it.
// For simplicity in this setup, we use the CDN for the worker.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += `\n--- Page ${i} ---\n${pageText}`;
    }

    return fullText;
  } catch (error) {
    console.error('PDF Extraction Error:', error);
    throw new Error('Failed to extract text from PDF. The file might be password protected or scanned image.');
  }
};