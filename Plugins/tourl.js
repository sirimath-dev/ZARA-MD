const axios = require('axios');
const config = require('../config');

/* Small caps helper */
const SC = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
    n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};
const sc = (str) => String(str).toLowerCase().replace(/[a-z]/g, (ch) => SC[ch]);
const getTitle = (cmd) => `${sc(config.BOT_NAME)} </> ${sc(cmd)}`;

/* Forward Context (NEWSLETTER_JID එක්ක) */
function forwardContext() {
    const contextInfo = { forwardingScore: 999, isForwarded: true };
    if (config.NEWSLETTER_JID) {
        contextInfo.forwardedNewsletterMessageInfo = {
            newsletterJid: config.NEWSLETTER_JID,
            newsletterName: config.BOT_NAME,
            serverMessageId: 1
        };
    }
    return contextInfo;
}

module.exports = {
    name: 'tourl',
    description: 'Upload files to sam-cdn.zone.id and get URL',
    category: 'tools',
    alias: ['upload', 'geturl', 'uguu'],

    async execute(sock, msg, args, text, ctx = {}) {
        const chatId = msg.key.remoteJid;
        const prefix = ctx.prefix || config.PREFIX || '.';

        try { await sock.sendMessage(chatId, { react: { text: '📤', key: msg.key } }); } catch (e) {}

        // Quoted message eka ganna
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quotedMessage) {
            return sock.sendMessage(chatId, { 
                text: `┌─ム ${getTitle('tourl')}\n\n╭─〔 *ᴜꜱᴀɢᴇ* 〕─┈⊷\n│ 🖼️ *ʀᴇᴘʟʏ* ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ, ᴠɪᴅᴇᴏ ᴏʀ ᴀɴʏ ꜰɪʟᴇ\n│ 🔗 *ᴏʀ ᴛʏᴘᴇ:* ${prefix}ᴛᴏᴜʀʟ\n╰─────────────┈⊷\n\n> ${config.BOT_FOOTER}`,
                contextInfo: forwardContext()
            }, { quoted: msg });
        }

        // Mime type eka hoyaganna (image, video, audio, document)
        const mime = quotedMessage.imageMessage?.mimetype 
                  || quotedMessage.videoMessage?.mimetype 
                  || quotedMessage.documentMessage?.mimetype 
                  || quotedMessage.audioMessage?.mimetype 
                  || '';

        if (!mime) {
            return sock.sendMessage(chatId, { 
                text: `❌ ᴘʟᴇᴀꜱᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴠᴀʟɪᴅ ꜰɪʟᴇ.\n\n> ${config.BOT_FOOTER}`,
                contextInfo: forwardContext()
            }, { quoted: msg });
        }

        // Uploading message eka yawanawa
        await sock.sendMessage(chatId, { 
            text: `⏳ ᴜᴘʟᴏᴀᴅɪɴɢ ꜰɪʟᴇ...\n\n> ${config.BOT_FOOTER}`,
            contextInfo: forwardContext()
        }, { quoted: msg });

        try {
            // File eka download karanawa
            const buffer = await sock.downloadMediaMessage({ message: quotedMessage });

            if (!buffer) {
                throw new Error('Failed to download quoted file');
            }

            // CDN ekata upload karanawa
            const response = await axios.post(
                'https://sam-cdn.zone.id/upload',
                buffer,
                {
                    headers: { 'Content-Type': 'application/octet-stream' },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                }
            );

            if (!response.data?.success) {
                throw new Error(response.data?.error || response.data?.message || 'Upload failed');
            }

            const upload = response.data.upload;
            const uploadUrl = typeof upload === 'string' ? upload : upload?.url;

            if (!uploadUrl) {
                throw new Error('Upload succeeded but no URL was returned');
            }

            const fileSizeKB = (buffer.length / 1024).toFixed(2);
            const fileSizeMB = (buffer.length / (1024 * 1024)).toFixed(2);

            // Result eka apu style ekata hadanawa
            const result = `┌─ム ${getTitle('tourl')}\n\n` +
                `╭─〔 *ᴜᴘʟᴏᴀᴅ ꜱᴜᴄᴄᴇꜱꜱ* 〕─┈⊷\n` +
                `│ 📂 *ᴛʏᴘᴇ:* ${mime.split('/')[0].toUpperCase()}\n` +
                `│ ⚖️ *ꜱɪᴢᴇ:* ${fileSizeKB} ᴋʙ (${fileSizeMB} ᴍʙ)\n` +
                `│ 🔗 *ᴜʀʟ:* ${uploadUrl}\n` +
                `╰─────────────┈⊷\n\n` +
                `> ${config.BOT_FOOTER}`;

            await sock.sendMessage(chatId, { 
                text: result,
                contextInfo: forwardContext()
            }, { quoted: msg });

        } catch (err) {
            console.error('Tourl Error:', err.message);
            
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;

            await sock.sendMessage(chatId, { 
                text: `┌─ム ${getTitle('tourl')}\n\n╭─〔 *ᴜᴘʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ* 〕─┈⊷\n│ ❌ *ᴇʀʀᴏʀ:* ${errorMsg}\n╰─────────────┈⊷\n\n> ${config.BOT_FOOTER}`,
                contextInfo: forwardContext()
            }, { quoted: msg });
        }
    }
};