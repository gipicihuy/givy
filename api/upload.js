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
      console.error('❌ No file provided');
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    // decode base64
    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.error('❌ Invalid base64 format');
      return res.status(400).json({ success: false, error: 'Invalid file format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const fileBuffer = Buffer.from(base64Data, 'base64');

    console.log(`📝 File info - MIME: ${mimeType}, Size: ${fileBuffer.length} bytes`);

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
    console.log(`✅ Temp file created: ${tempFilePath}`);

    // upload ke ikram.my.id
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempFilePath));

    console.log('🚀 Uploading to ikram.my.id...');

    const response = await fetch('https://ikram.my.id/upload/', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
      timeout: 30000
    });

    console.log(`📊 Response status: ${response.status}`);

    const responseText = await response.text();
    console.log(`📄 RAW Response: ${responseText}`);

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status}`);
      throw new Error(`Upload failed: ${response.status} ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📦 Parsed JSON:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    // ikram.my.id response format: { success: true, message: "...", filename: "...", url: "..." }
    if (!data.success || !data.url) {
      console.error('❌ Invalid response:', data);
      throw new Error(data.message || 'Upload failed - no URL returned');
    }

    const fileUrl = data.url;
    console.log(`✅ Upload success! URL: ${fileUrl}`);

    return res.status(200).json({
      success: true,
      url: fileUrl,
      preview: fileUrl
    });

  } catch (error) {
    console.error('❌ Upload error:', error.message);
    console.error('Stack:', error.stack);
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
        console.log('🧹 Temp file cleaned up');
      } catch (err) {
        console.warn('⚠️ Failed to delete temp file:', err.message);
      }
    }
  }
}
