const fs = require('fs');
const path = require('path');
const config = require('../config');

/* Small caps helper */
const SC = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
    n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};
const sc = (str) => String(str).toLowerCase().replace(/[a-z]/g, (ch) => SC[ch]);

// 🟢 Dynamic Title Generator
const getTitle = (cmd) => `${sc(config.BOT_NAME)} </> ${sc(cmd)}`;

const CATALOG = [
    ['alive', 'Check bot status'], ['ping', 'Check bot speed'], ['uptime', 'Bot running time'],
    ['owner', 'Owner contact'], ['guide', 'How to use the bot'], ['menu2', 'Alternative menu'],
    ['tiktok', 'TikTok downloader', ['tt']], ['ytmp3', 'YouTube to MP3'], ['ytmp4', 'YouTube video downloader'],
    ['ig', 'Instagram downloader'], ['fb', 'Facebook downloader'],
    ['sticker', 'Create a sticker'], ['toimg', 'Sticker to image'], ['tourl', 'Upload media to a link'],
    ['ocr', 'Read text from an image'], ['tts', 'Text to speech'], ['poll', 'Create a poll'],
    ['shazam', 'Identify a song'], ['textpro', 'Text logo maker'], ['chid', 'Get chat / channel ID'],
    ['ai', 'Chat with AI'], ['ai-search', 'AI web search'], ['aiv', ''], ['gen', 'AI image generator'],
    ['blue', ''], ['flag', ''],
    ['hide', ''], ['guessgender', 'Guess gender from a name'], ['agecalculator', 'Calculate age'], ['style', 'Fancy text styles'],
    ['weather', 'Weather info'], ['wiki', 'Wikipedia search'], ['movie', 'Search a movie'],
    ['waifu', 'Random waifu image'], ['neko', 'Random neko image'], ['kitsune', 'Random kitsune image'], ['husbando', 'Random husbando image'],
    ['tagall', 'Mention all members'], ['tagall1', 'Mention all (style 2)'], ['tagme', 'Mention yourself'],
    ['couplepp', 'Couple profile pictures'], ['group', 'Open / close group'], ['ginfo', 'Group info'],
    ['antigst', ''], ['link', 'Get group invite link'], ['mute', 'Close the group'], ['unmute', 'Open the group'],
    ['welcome', 'Welcome message on/off'], ['antilink', 'Anti link on/off'],
    ['gstatus', 'Group status'],
    ['channelid', 'Get channel ID'],
    ['kick', 'Remove a member'], ['add', 'Add a member'], ['promote', 'Make admin'], ['demote', 'Remove admin'], ['warn', 'Warn a member'], ['del', 'Delete a message'],
    ['settings', 'View bot settings'], ['setprefix', 'Change the prefix'], ['antidelete', 'Anti-delete on/off'],
    ['autoread', 'Auto read messages'], ['autoreact', 'Auto react to messages'], ['mode', 'Public / private mode']
];

/* Scan plugins to check which commands are ready */
function scanPlugins() {
    const found = new Set();
    for (const file of fs.readdirSync(__dirname)) {
        if (!file.endsWith('.js')) continue;
        try {
            const p = require(path.join(__dirname, file));
            if (!p || !p.name || !p.execute) continue;
            const names = [p.name, ...[].concat(p.alias || [], p.aliases || [])];
            for (const n of names) found.add(String(n).toLowerCase());
        } catch (e) {}
    }
    return found;
}

/* ඔක්කොම commands එකම list එකට ගන්නවා */
function getAllCommands() {
    const readySet = scanPlugins();
    const allCmds = [];
    
    // 1. Catalog එකේ තියෙන ඒවා එකතු කිරීම
    for (const [name, desc, alias] of CATALOG) {
        allCmds.push({
            name,
            desc: desc || '',
            alias: alias || [],
            ready: readySet.has(name)
        });
    }

    // 2. Catalog එකේ නැති අලුත් plugin තියෙනවා නම් ඒවත් එකතු කිරීම
    const known = new Set();
    allCmds.forEach(c => { known.add(c.name.toLowerCase()); c.alias.forEach(a => known.add(a.toLowerCase())); });

    const pluginsDir = fs.readdirSync(__dirname);
    for (const file of pluginsDir) {
        if (!file.endsWith('.js')) continue;
        try {
            const p = require(path.join(__dirname, file));
            if (!p || !p.name || !p.execute) continue;
            const name = String(p.name).toLowerCase();
            const alias = [].concat(p.alias || [], p.aliases || []).map(a => String(a).toLowerCase());
            
            if (name === 'menu' || name === 'menu2' || known.has(name) || alias.some(a => known.has(a))) continue;

            allCmds.push({
                name,
                desc: p.description || '',
                alias,
                ready: true
            });
        } catch (e) {}
    }

    // අකුරු අනුව (A-Z) පිළිවෙලට හදනවා
    return allCmds.sort((a, b) => a.name.localeCompare(b.name));
}

function buildFlatList(prefix) {
    const cmds = getAllCommands();
    const lines = ['┌─ム ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs', '│'];
    
    for (const cmd of cmds) {
        const al = cmd.alias.length ? ' / ' + cmd.alias.map((a) => prefix + sc(a)).join(' / ') : '';
        const desc = cmd.ready && cmd.desc ? ` — ${cmd.desc}` : '';
        lines.push(`│ ᪣ ${prefix}${sc(cmd.name)}${al}${cmd.ready ? desc : ' ⏳'}`);
    }
    
    lines.push('╰─────────◆────────╯');
    return lines.join('\n');
}

/* Forward context (Text ekata witharai) */
function forwardContext() {
    const contextInfo = { forwardingScore: 999, isForwarded: true };
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
    name: 'menu2',
    description: 'Alternative menu',
    category: 'general',
    alias: ['allmenu', 'list'],

    async execute(sock, msg, args, text, ctx = {}) {
        const jid = msg.key.remoteJid;
        const prefix = ctx.prefix || config.PREFIX || '.';

        try { await sock.sendMessage(jid, { react: { text: '📜', key: msg.key } }); } catch (e) {}

        const listText = buildFlatList(prefix);
        
        // 🟢 Title eka methana enne dynamic widihata
        const textCaption = `┌─ム ${getTitle('menu2')}\n\n${listText}\n\n> ${config.BOT_FOOTER}`;
        const contextInfo = forwardContext();

        // 1. Image eka yawanawa (Forward context NATHUWA - normal image ekak)
        try {
            await sock.sendMessage(jid, { 
                image: { url: config.RCD_IMAGE_PATH } 
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