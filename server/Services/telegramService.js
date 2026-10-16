import fs from 'fs';

export let globalTelegramChatId = null;

export const setGlobalChatId = (id) => {
    globalTelegramChatId = id;
};

export const sendTelegramAlert = async (message) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    let chatId = globalTelegramChatId;
    
    // Try to load from file if memory is null
    if (!chatId) {
        try {
            if (fs.existsSync('telegram.txt')) {
                const data = JSON.parse(fs.readFileSync('telegram.txt', 'utf8'));
                chatId = data.chatId;
                globalTelegramChatId = chatId;
            }
        } catch (e) {}
    }
    
    if (!token || !chatId) {
        console.log('[Telegram] Skipping alert - no token or chat ID found.');
        return;
    }
    
    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: globalTelegramChatId,
                text: `🚨 <b>System Alert:</b>\n\n${message}`,
                parse_mode: 'HTML'
            })
        });
        console.log(`[Telegram] Successfully dispatched automated alert to user.`);
    } catch (err) {
        console.error('Error sending automated telegram alert:', err.message);
    }
};
