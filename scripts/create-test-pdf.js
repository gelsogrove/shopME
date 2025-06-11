const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Read the text content
const textContent = fs.readFileSync(path.join(__dirname, '..', 'prisma', 'temp', 'test-document.txt'), 'utf8');

// Create a new PDF document
const doc = new PDFDocument();

// Set up the output path
const outputPath = path.join(__dirname, '..', 'prisma', 'temp', 'e-commerce-regulations.pdf');

// Pipe the PDF to a file
doc.pipe(fs.createWriteStream(outputPath));

// Add title
doc.fontSize(20)
   .text('E-COMMERCE INTERNATIONAL TRADE REGULATIONS', {
     align: 'center'
   });

doc.moveDown(2);

// Add content
doc.fontSize(12)
   .text(textContent, {
     align: 'left',
     lineGap: 5
   });

// Finalize the PDF
doc.end();

console.log(`PDF created successfully at: ${outputPath}`); 