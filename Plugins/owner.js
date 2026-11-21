const config = require('../config');

/* Small caps helper */
const SC = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
    n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};
const sc = (str) => String(str).toLowerCase().replace(/[a-z]/g, (ch) => SC[ch]);

// 🟢 Dynamic Title Generator
const getTitle = (cmd) => `${sc(config.BOT_NAME)} </> ${sc(cmd)}`;

// 👇 ඔයා එවපු පින්තූරයේ ලින්ක් එක
const OWNER_IMAGE = 'https://i.ibb.co/20V1mgfj/Gemini-Generated-Image-9e5j519e5j519e5j.jpg';

function buildOwner(prefix) {
    const ownerNum = String(config.OWNER_NUMBER).replace(/\D/g, '');
    return [
        '╭─〔 *ᴏᴡɴᴇʀ ᴄᴏɴᴛᴀᴄᴛ* 〕─┈⊷',
        `│ 👑 *ɴᴀᴍᴇ:* ${config.BOT_NAME} Owner`,
        `│ 📞 *ɴᴜᴍʙᴇʀ:* +${ownerNum}`,
        `│ 💬 *ᴄʜᴀᴛ:* https://wa.me/${ownerNum}`,
        `│ 🔣 *ᴘʀᴇꜰɪx:* ${prefix}`,
        '╰─────────────┈⊷'
    ].join('\n');
}

/* Forward context */
function forwardContext() {
    const contextInfo = {
        forwardingScore: 999,
        isForwarded: true
    };
    
    // 👇 config.js eke thiyena NEWSLETTER_JID eka methana dammah
    if (config.NEWSLETTER_JID) {
        contextInfo.forwardedNewsletterMessageInfo = {
            newsletterJid: config.NEWSLETTER_JID,
            newsletterName: config.BOT_NAME,
            serverMessageId: 1
        };
    }
    return contextInfo;
}

/* Owner ge contact card eka (vCard) */
function ownerVCard() {
    const ownerNum = String(config.OWNER_NUMBER).replace(/\D/g, '');
    return {
        displayName: `${config.BOT_NAME} ᴏᴡɴᴇʀ`,
        contacts: [{
            vcard: [
                'BEGIN:VCARD',
                'VERSION:3.0',
                `FN:${config.BOT_NAME} Owner`,
                `ORG:${config.BOT_NAME}`,
                `TEL;type=CELL;type=VOICE;waid=${ownerNum}:+${ownerNum}`,
                'END:VCARD'
            ].join('\n')
        }]
    };
}

/* ------------------------------------------------------------------ */
/*  Plugin                                                             */
/* ------------------------------------------------------------------ */
module.exports = {
    name: 'owner',
    description: 'Owner contact',
    category: 'general',
    alias: ['creator', 'dev'],

    async execute(sock, msg, args, text, ctx = {}) {
        const jid = msg.key.remoteJid;
        const prefix = ctx.prefix || config.PREFIX || '.';

        try { await sock.sendMessage(jid, { react: { text: '👑', key: msg.key } }); } catch (e) {}

        const infoText = buildOwner(prefix);
        
        // 🟢 Title eka
        const textCaption = `┌─ム ${getTitle('owner')}\n\n${infoText}\n\n> ${config.BOT_FOOTER}`;
        const contextInfo = forwardContext();

        // 1. Image eka saha Text eka EKAMA message ekak widihata yawanawa
        try {
            await sock.sendMessage(jid, { 
                image: { url: OWNER_IMAGE },
                caption: textCaption,
                contextInfo: contextInfo // Forwarded look eka mekata yanawa
            }, { quoted: msg });
        } catch (e) {
            console.log('Image send failed, sending text fallback');
            // Image eka yawanna bari unoth text ekak widihata yawanawa
            await sock.sendMessage(jid, { 
                text: textCaption, 
                contextInfo 
            }, { quoted: msg });
        }

        // 2. Owner ge Contact Card (vCard) eka yawanawa (Meka wenama yanna ona)
        try {
            await sock.sendMessage(jid, ownerVCard(), { quoted: msg });
        } catch (e) {
            console.error('vCard send failed:', e.message);
        }
    }
};