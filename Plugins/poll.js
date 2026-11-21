const config = require('../config');

/* Small caps helper */
const SC = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
    n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};
const sc = (str) => String(str).toLowerCase().replace(/[a-z]/g, (ch) => SC[ch]);
const getTitle = (cmd) => `${sc(config.BOT_NAME)} </> ${sc(cmd)}`;

/* Forward Context */
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
    name: 'poll',
    description: 'Create a WhatsApp poll',
    category: 'tools',
    alias: ['vote'],

    async execute(sock, msg, args, text, ctx = {}) {
        const chatId = msg.key.remoteJid;
        const prefix = ctx.prefix || config.PREFIX || '.';

        try { await sock.sendMessage(chatId, { react: { text: '🗳️', key: msg.key } }); } catch (e) {}

        // Args nathi nam help eka yawanawa
        if (!args || args.length === 0) {
            return sock.sendMessage(chatId, { 
                text: `┌─ム ${getTitle('poll')}\n\n` +
                      `╭─〔 *ᴜꜱᴀɢᴇ* 〕─┈⊷\n` +
                      `│ 🗳️ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴘᴏʟʟ <ᴘᴏʟʟ ɴᴀᴍᴇ>;<ᴏᴘᴛɪᴏɴ 1>;<ᴏᴘᴛɪᴏɴ 2>\n` +
                      `│ 📌 *ᴇxᴀᴍᴘʟᴇ:* ${prefix}ᴘᴏʟʟ ꜰᴀᴠ ᴄᴏʟᴏʀ?;ʀᴇᴅ;ɢʀᴇᴇɴ;ʙʟᴜᴇ\n` +
                      `╰─────────────┈⊷\n\n> ${config.BOT_FOOTER}`,
                contextInfo: forwardContext()
            }, { quoted: msg });
        }

        try {
            // Text eka ; walin wen karala gannawa
            const data = args.join(" ");
            const parts = data.split(";").map(x => x.trim());

            const pollName = parts.shift();
            if (!pollName || parts.length < 2) {
                return sock.sendMessage(chatId, { 
                    text: `❌ ɴᴇᴇᴅ ᴀ ᴘᴏʟʟ ɴᴀᴍᴇ ᴀɴᴅ ᴀᴛ ʟᴇᴀꜱᴛ 2 ᴏᴘᴛɪᴏɴꜱ!\n\n> ${config.BOT_FOOTER}`,
                    contextInfo: forwardContext()
                }, { quoted: msg });
            }

            // Poll eka yawanawa (Forward context ekath ekka)
            const pollMessage = {
                poll: {
                    name: pollName,
                    values: parts,
                    selectableCount: 1,
                },
                contextInfo: forwardContext() // 👈 Poll ekata forwarded context eka dammah
            };

            await sock.sendMessage(chatId, pollMessage, { quoted: msg });
            
            try { await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } }); } catch(e) {}

        } catch (err) {
            console.error("Poll plugin error:", err.message);
            await sock.sendMessage(chatId, { 
                text: `❌ ꜰᴀɪʟᴇᴅ ᴛᴏ ᴄʀᴇᴀᴛᴇ ᴘᴏʟʟ.\n\n${err.message}\n\n> ${config.BOT_FOOTER}`,
                contextInfo: forwardContext()
            }, { quoted: msg });
        }
    },
};