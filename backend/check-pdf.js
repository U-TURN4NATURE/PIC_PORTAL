const fs = require('fs');
const pdf = require('pdf-parse');

async function checkPDF() {
  const url = "https://res.cloudinary.com/dxvr20qlb/image/upload/v1783012041/pic-portal/docs/document-1783012040898.pdf";
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  
  const data = await pdf(buffer);
  console.log(data.text.substring(0, 500));
}
checkPDF().catch(console.error);
