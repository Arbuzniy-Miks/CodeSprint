const Tesseract = require('tesseract.js');

async function extractTextFromImage(filePath) {
  const result = await Tesseract.recognize(filePath, 'rus+eng', {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR progress: ${Math.round(m.progress * 100)}%`);
      }
    }
  });

  return result.data.text ? result.data.text.trim() : '';
}

module.exports = {
  extractTextFromImage
};