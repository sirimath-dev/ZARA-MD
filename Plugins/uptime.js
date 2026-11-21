const config = require('../config');

/* Small caps helper */
const SC = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
    n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};
const sc = (str) => String(str).toLowerCase().replace(/[a-z]/g, (ch) => SC[ch]);

// 🟢 Dynamic Title Generator
const getTitle = (cmd) => `${sc(config.BOT_NAME)} </> ${sc(cmd)}`;

// Uptime eka ලස්සනට හදන Function එක
function fmtUptime(sec) {
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    
    const parts = [];
    if (d > 0) parts.push(`${String(d).padStart(2, '0')}ᴅ`);
    parts.push(`${String(h).padStart(2, '0')}ʜ`);
    parts.push(`${String(m).padStart(2, '0')}ᴍ`);
    parts.push(`${String(s).padStart(2, '0')}s`);
    return parts.join(' ');
}

function buildUptime(prefix) {
    const uptime = fmtUptime(process.uptime());
    return [
        '╭─〔 *ʙᴏᴛ ʀᴜɴᴛɪᴍᴇ* 〕─┈⊷',
        `│ ⏱️ *ᴜᴘᴛɪᴍᴇ:* ${uptime}`,
        `│ ⚡ *ꜱᴛᴀᴛᴜꜱ:* ᴀᴄᴛɪᴠᴇ`,
        `│ 🔣 *ᴘʀᴇꜰɪx:* ${prefix}`,
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
    name: 'uptime',
    description: 'Bot running time',
    category: 'general',
    alias: ['up', 'runtime'],

    async execute(sock, msg, args, text, ctx = {}) {
        const jid = msg.key.remoteJid;
        const prefix = ctx.prefix || config.PREFIX || '.';

        try { await sock.sendMessage(jid, { react: { text: '⏱️', key: msg.key } }); } catch (e) {}

        const infoText = buildUptime(prefix);
        
        // 🟢 Title eka methana enne dynamic widihata
        const textCaption = `┌─ム ${getTitle('uptime')}\n\n${infoText}\n\n> ${config.BOT_FOOTER}`;
        const contextInfo = forwardContext();



        // 2. Text eka yawanawa (Forward context EKKAMA)
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
