const config = require('../config');

/* Small caps helper */
const SC = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
    n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};
const sc = (str) => String(str).toLowerCase().replace(/[a-z]/g, (ch) => SC[ch]);

// 🟢 Dynamic Title Generator
const getTitle = (cmd) => `${sc(config.BOT_NAME)} </> ${sc(cmd)}`;

// ඕන නම් මෙතන ඔයාට කැමති පින්තූරයක් දාගන්න පුළුවන් (දැනට default config එකේ තියෙන එක යයි)
const GUIDE_IMAGE = config.RCD_IMAGE_PATH; 

function buildGuide(prefix) {
    return [
        '╭─〔 *ʜᴏᴡ ᴛᴏ ᴜꜱᴇ* 〕─┈⊷',
        `│ 1️⃣ *ꜱᴛᴇᴘ 1:* ᴛʏᴘ ${prefix}ᴍᴇɴᴜ ᴛᴏ ꜱᴇᴇ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅꜱ`,
        `│ 2️⃣ *ꜱᴛᴇᴘ 2:* ᴜꜱᴇ ${prefix}<ᴄᴏᴍᴍᴀɴᴅ> ᴛᴏ ᴇxᴇᴄᴜᴛᴇ`,
        `│ 3️⃣ *ꜱᴛᴇᴘ 3:* ᴇxᴀᴍᴘʟᴇ - ${prefix}ᴘɪɴɢ`,
        '│',
        '│ 💡 *ɴᴏᴛᴇ:*',
        `│ • ꜱᴏᴍᴇ ᴄᴏᴍᴍᴀɴᴅꜱ ᴀʀᴇ ɢʀᴏᴜᴘ ᴏɴʟʏ`,
        '│ • ᴅᴏ ɴᴏᴛ ꜱᴘᴀᴍ ᴛʜᴇ ʙᴏᴛ',
        `│ • ᴜꜱᴇ ${prefix}ᴏᴡɴᴇʀ ꜰᴏʀ ꜱᴜᴘᴘᴏʀᴛ`,
        '╰─────────────┈⊷'
    ].join('\n');
}

/* Forward context (Text ekata witharai) */
function forwardContext() {
    const contextInfo = {
        forwardingScore: 999,
        isForwarded: true
    };
    
    if (config.NEWSLETTER_ID) {
        contextInfo.forwardedNewsletterMessageInfo = {
            newsletterJid: config.NEWSLETTER_ID,
            newsletterName: config.BOT_NAME,
            serverMessageId: 1
        };
    }
    return contextInfo;
}

/* ------------------------------------------------------------------ */
/*  Plugin                                                             */
/* ------------------------------------------------------------------ */
module.exports = {
    name: 'guide',
    description: 'How to use the bot',
    category: 'general',
    alias: ['howto', 'tutorial', 'help2'],

    async execute(sock, msg, args, text, ctx = {}) {
        const jid = msg.key.remoteJid;
        const prefix = ctx.prefix || config.PREFIX || '.';

        try { await sock.sendMessage(jid, { react: { text: '📖', key: msg.key } }); } catch (e) {}

        const infoText = buildGuide(prefix);
        
        // 🟢 Title eka methana enne dynamic widihata
        const textCaption = `┌─ム ${getTitle('guide')}\n\n${infoText}\n\n> ${config.BOT_FOOTER}`;
        const contextInfo = forwardContext();

        // 1. Image eka yawanawa (Forward context NATHUWA - normal image ekak)
        try {
            await sock.sendMessage(jid, { 
                image: { url: GUIDE_IMAGE } 
            }, { quoted: msg });
        } catch (e) {
            console.log('Image failed, skipping to text');
        }

        // 2. Text eka yawanawa (Forward context EKKAMA - forwarded una wage)
        try {
            await sock.sendMessage(jid, { 
                text: textCaption, 
                contextInfo 
            });
        } catch (e) {
            console.error('Text send failed:', e.message);
        }
    }
};