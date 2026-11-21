const axios = require('axios');
const config = require('../config');

const SC = { a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ' };
const sc = (str) => String(str).toLowerCase().replace(/[a-z]/g, (ch) => SC[ch]);
const getTitle = (cmd) => `${sc(config.BOT_NAME)} </> ${sc(cmd)}`;

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
    name: 'pair',
    description: 'Pair bot with WhatsApp number',
    category: 'tools',
    alias: ['pairing', 'getcode'],

    async execute(sock, msg, args, text, ctx = {}) {
        const chatId = msg.key.remoteJid;
        const prefix = ctx.prefix || config.PREFIX || '.';

        try { await sock.sendMessage(chatId, { react: { text: '🔗', key: msg.key } }); } catch (e) {}

        if (!args.length) {
            return sock.sendMessage(chatId, { 
                text: `┌─ム ${getTitle('pair')}\n\n╭─〔 *ᴜꜱᴀɢᴇ* 〕─┈⊷\n│ 📱 *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴘᴀɪʀ <ɴᴜᴍʙᴇʀ>\n│ 📌 *ᴇxᴀᴍᴘʟᴇ:* ${prefix}ᴘᴀɪʀ 94771234567\n╰─────────────┈⊷\n\n> ${config.BOT_FOOTER}`,
                contextInfo: forwardContext()
            }, { quoted: msg });
        }

        let number = args[0].replace(/[^0-9]/g, '');

        if (number.length < 10) {
            return sock.sendMessage(chatId, { 
                text: `❌ ᴘʟᴇᴀꜱᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴘʜᴏɴᴇ ɴᴜᴍʙᴇʀ ᴡɪᴛʜ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ.\n\n> ${config.BOT_FOOTER}`,
                contextInfo: forwardContext()
            }, { quoted: msg });
        }

        await sock.sendMessage(chatId, { 
            text: `⏳ ɢᴇɴᴇʀᴀᴛɪɴɢ ᴘᴀɪʀ ᴄᴏᴅᴇ ꜰᴏʀ ${number}...\n\n> ${config.BOT_FOOTER}`,
            contextInfo: forwardContext()
        }, { quoted: msg });

        try {
            const apiUrl = `https://bot.anuhas.site/code?number=${encodeURIComponent(number)}`;
            const response = await axios.get(apiUrl);
            const result = response.data;

            const pairCode = result.code || result.pair_code || result.pairingCode;

            if (!pairCode) {
                throw new Error('ᴄᴏᴜʟᴅ ɴᴏᴛ ꜰɪɴᴅ ᴘᴀɪʀ ᴄᴏᴅᴇ ɪɴ ᴀᴘɪ ʀᴇꜱᴘᴏɴꜱᴇ');
            }

            const caption = `🔗 *ᴘᴀɪʀ ᴄᴏᴅᴇ ɢᴇɴᴇʀᴀᴛᴇᴅ*\n\n` +
                            `📱 *ɴᴜᴍʙᴇʀ:* ${number}\n` +
                            `🔑 *ᴄᴏᴅᴇ:* ${pairCode}\n\n` +
                            `📌 *ɪɴꜱᴛʀᴜᴄᴛɪᴏɴꜱ:*\n` +
                            `1️⃣ ᴏᴘᴇɴ ᴡʜᴀᴛꜱᴀᴘᴘ\n` +
                            `2️⃣ ɢᴏ ᴛᴏ ʟɪɴᴋᴇᴅ ᴅᴇᴠɪᴄᴇꜱ\n` +
                            `3️⃣ ᴇɴᴛᴇʀ ᴛʜᴇ ᴄᴏᴅᴇ ᴀʙᴏᴠᴇ\n\n` +
                            `> ${config.BOT_FOOTER}`;

            await sock.sendMessage(chatId, {
                text: caption,
                contextInfo: forwardContext()
            }, { quoted: msg });

        } catch (err) {
            console.error('Pair Error:', err.message);
            await sock.sendMessage(chatId, { 
                text: `❌ ᴇʀʀᴏʀ: ${err.message}\n\n> ${config.BOT_FOOTER}`,
                contextInfo: forwardContext()
            }, { quoted: msg });
        }
    }
};