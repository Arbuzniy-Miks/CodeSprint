const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractTextFromPdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);

  return data.text ? data.text.trim() : '';
}

module.exports = {
  extractTextFromPdf
};