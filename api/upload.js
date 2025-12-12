import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import os from 'os';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFilePath = null;

  try {
    const { file } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // decode base64
    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid file format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // buat nama file
    const extFromMime = mimeType.split('/')[1] || 'jpg';
    const ext =
      extFromMime === 'jpeg'
        ? 'jpg'
        : ['jpg', 'png', 'webp', 'gif'].includes(extFromMime)
        ? extFromMime
        : 'jpg';

    const fileName = `upload_${Date.now()}.${ext}`;
    tempFilePath = path.join(os.tmpdir(), fileName);

    // save buffer ke temporary file
    fs.writeFileSync(tempFilePath, fileBuffer);

    // upload ke tmpfiles.org
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempFilePath));

    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // tmpfiles.org response format: { status: 200, file: { url: "..." } }
    if (!data.file || !data.file.url) {
      console.error('Unexpected tmpfiles response:', data);
      throw new Error('Upload failed - no file URL in response');
    }

    const fileUrl = data.file.url;

    // Return format yang expected frontend
    return res.status(200).json({
      success: true,
      url: fileUrl,
      preview: fileUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Upload failed',
      details: error.message
    });
  } finally {
    // clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.warn('Failed to delete temp file:', err);
      }
    }
  }
}
