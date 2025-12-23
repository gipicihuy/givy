// File: api/wa-react.js
// WA Channel React API with Telegram Notification

const API_URL = 'https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post';
const API_TOKEN = 'c8b912b333161b4dc1b185bbf49d29c43d898719d6b9a5208cc1bf9ef1fcccb9'; // Bearer token
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendNotificationToTelegram = async (postLink, reacts, successCount, failedCount, ipAddress, userAgent) => {
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    
    const totalReacts = reacts.split(',').length;
    const successRate = totalReacts > 0 ? ((successCount / totalReacts) * 100).toFixed(1) : '0.0';

    const message = `📲 *WA CHANNEL REACT*\n\n` +
                   `🔗 *POST:* ${postLink}\n` +
                   `😊 *REACTS:* ${reacts}\n\n` +
                   
                   `📊 *RESULTS:*\n` +
                   `✅ Success: ${successCount}\n` +
                   `❌ Failed: ${failedCount}\n` +
                   `📈 Rate: ${successRate}%\n\n` +
                   
                   `👤 *USER DATA:*\n` +
                   `🌐 IP: ${ipAddress}\n` +
                   `📱 Agent: ${userAgent.substring(0, 40)}...\n` +
                   `🕒 Time: ${timestamp}\n\n` +
                   
                   `_🤖 Sent via Givy WA React Tool_`;

    try {
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const res = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        if (res.ok) {
            console.log('✅ Telegram notification sent successfully.');
            return true;
        } else {
            console.error('❌ Telegram API error:', await res.text());
            return false;
        }
    } catch (error) {
        console.error('❌ Error sending Telegram notification:', error);
        return false;
    }
};

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ 
            success: false, 
            error: 'Method Not Allowed' 
        });
    }

    const { post_link, reacts } = request.body;
    
    const userAgent = request.headers['user-agent'] || 'N/A';
    const ipAddress = request.headers['x-real-ip'] || request.headers['x-forwarded-for'] || 'N/A';
    const cleanIp = ipAddress.split(',')[0].trim();

    // Validasi input
    if (!post_link || !reacts) {
        return response.status(400).json({ 
            success: false, 
            error: 'Missing required fields: post_link or reacts' 
        });
    }

    // Validasi format link
    const linkRegex = /^https:\/\/whatsapp\.com\/channel\/[a-zA-Z0-9]+\/\d+$/;
    if (!linkRegex.test(post_link)) {
        return response.status(400).json({ 
            success: false, 
            error: 'Invalid WhatsApp channel link format' 
        });
    }

    // Validasi emoji (max 5)
    const emojiArray = reacts.split(',');
    if (emojiArray.length > 5) {
        return response.status(400).json({ 
            success: false, 
            error: 'Maximum 5 emojis allowed' 
        });
    }

    try {
        // Call external API
        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                post_link: post_link,
                reacts: reacts
            })
        });

        const data = await apiResponse.json();

        if (apiResponse.ok) {
            // Hitung success dan failed
            const totalEmojis = emojiArray.length;
            const successCount = data.success_count !== undefined ? data.success_count : totalEmojis;
            const failedCount = totalEmojis - successCount;

            // Send Telegram notification
            if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
                await sendNotificationToTelegram(
                    post_link, 
                    reacts, 
                    successCount, 
                    failedCount, 
                    cleanIp, 
                    userAgent
                );
            }

            return response.status(200).json({
                success: true,
                message: data.message || 'Reactions sent successfully!',
                success_count: successCount,
                failed_count: failedCount,
                data: data
            });
        } else {
            console.error('External API error:', data);
            return response.status(apiResponse.status).json({
                success: false,
                error: data.message || data.error || 'Failed to send reactions',
                details: data
            });
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return response.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
}
