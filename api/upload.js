import fetch from 'node-fetch';
import FormData from 'form-data';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    const mimeType = matches[1];            // contoh: image/jpeg
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

    // upload ke qu.ax
    const formData = new FormData();
    formData.append('files[]', fileBuffer, {
      filename: fileName,
      contentType: mimeType
    });

    const response = await fetch('https://qu.ax/upload.php', {
      method: 'POST',
      body: formData,
      headers: {
        Referer: 'https://qu.ax/',
        ...formData.getHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();

    // pastikan ada file
    if (!data.success || !data.files || data.files.length === 0) {
      throw new Error('Upload failed - no file URL returned');
    }

    const fileInfo = data.files[0];

    // URL preview → https://qu.ax/sgCcd
    const previewUrl = fileInfo.url;

    // ambil hash → sgCcd
    const hash = previewUrl.split('/').pop();

    // generate direct link
    const directUrl = `https://qu.ax/x/${hash}.${ext}`;

    return res.status(200).json({
      success: true,
      url: directUrl,
      preview: previewUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message
    });
  }
}
