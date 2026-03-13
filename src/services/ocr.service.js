const Tesseract = require('tesseract.js');

async function extractTextFromImage(filePath) {
  const result = await Tesseract.recognize(filePath, 'rus+eng', {
    logger: (message) => {
      if (message.status === 'recognizing text') {
        console.log(`OCR progress: ${Math.round(message.progress * 100)}%`);
      }
    }
  });

  return result.data.text ? result.data.text.trim() : '';
}

module.exports = {
  extractTextFromImage
};