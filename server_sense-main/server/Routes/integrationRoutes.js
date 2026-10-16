import express from 'express';
import fs from 'fs';
import { setGlobalChatId } from '../Services/telegramService.js';

const router = express.Router();

router.post('/telegram/test', async (req, res) => {
    const { chatId } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!chatId) {
        return res.status(400).json({ error: 'Chat ID is required' });
    }

    if (!token) {
        return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN is not configured in the backend .env file' });
    }

    try {
        // Save it so the system can use it for real-time automated alerts
        setGlobalChatId(chatId);
        fs.writeFileSync('telegram.txt', JSON.stringify({ chatId }));

        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: "✅ *ServerSense Alert:*\n\nYour Telegram integration has been successfully connected! You will now receive real-time host telemetry alerts here.",
                parse_mode: 'Markdown'
            })
        });

        const data = await response.json();

        if (data.ok) {
            res.status(200).json({ success: true, message: 'Message sent successfully!' });
        } else {
            console.error('Telegram API Error:', data);
            res.status(400).json({ error: data.description || 'Failed to send message via Telegram' });
        }
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        res.status(500).json({ error: 'Internal server error while contacting Telegram' });
    }
});

export default router;
