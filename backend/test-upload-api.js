const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { execSync } = require('child_process');

async function testUpload() {
  // Create a 1-page dummy PDF using base64 (a valid empty PDF)
  const pdfBase64 = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTAz1DMyAQsXcqJzE3FQg29jUwtjQwMDUwBTEswSywIIMYACVaw0vCmVuZHN0cmVhbQplbmRvYmoKCjMgMCBvYmoKNDcKZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvUGFnZS9NZWRpYUJveFswIDAgNTk1IDg0Ml0vUmVzb3VyY2VzPDwvRm9udDw8L0YxIDEgMCBSPj4+Pi9Db250ZW50cyAyIDAgUi9QYXJlbnQgNSAwIFI+PgplbmRvYmoKCjEgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCgo1IDAgb2JqCjw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWzQgMCBSXT4+CmVuZG9iagoKNiAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNSAwIFI+PgplbmRvYmoKCjcgMCBvYmoKPDwvUHJvZHVjZXIoaUdvcmQpL0NyZWF0aW9uRGF0ZShEOjIwMjExMTE1MTgyNzQ4KzAyJzAwJyk+PgplbmRvYmoKCnhyZWYKMCA4CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDIxOSAwMDAwMCBuIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAxNDYgMDAwMDAgbiAKMDAwMDAwMDE2NyAwMDAwMCBuIAowMDAwMDAwMjg3IDAwMDAwIG4gCjAwMDAwMDAzNDYgMDAwMDAgbiAKMDAwMDAwMDM5NSAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgOC9Sb290IDYgMCBSL0luZm8gNyAwIFI+PgpzdGFydHhyZWYKNDc0CiUlRU9GCg==";
  const pdfBuffer = Buffer.from(pdfBase64, 'base64');
  fs.writeFileSync('dummy.pdf', pdfBuffer);

  const form = new FormData();
  form.append('type', 'TERMS_CONDITIONS');
  form.append('title', 'AI Test Policy');
  form.append('version', '1.0');
  form.append('isRequired', 'false');
  form.append('document', fs.createReadStream('dummy.pdf'), 'dummy.pdf');

  try {
    const res = await axios.post('http://localhost:5000/api/admin/policies/upload', form, {
      headers: { ...form.getHeaders() }
    });
    console.log("Upload Success:", res.data);
    const fileUrl = res.data.data.fileUrl;
    
    // Now fetch the fileUrl directly with axios
    const download = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    console.log("Downloaded size:", download.data.length, "bytes");
    
    // Check if it's our 694 byte PDF or the giant 24-page one (which is usually >100KB)
    if (download.data.length < 1000) {
      console.log("SUCCESS! The system properly saved and returned the small PDF.");
    } else {
      console.log("FAILURE! The system returned a giant PDF instead of our 1-page PDF.");
    }
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
testUpload();
