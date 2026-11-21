const fs = require('fs');
const path = require('path');
const config = require('../config');

const MENU_IMAGE = 'https://file.dnuz.top/9dg7a1.jpg';
const SMALL_LOGO = config.RCD_IMAGE_PATH || 'https://files.catbox.moe/29hxc2.jpg';
const PREFIX = config.PREFIX || '.';
const TTL = 10 * 60 * 1000;
const sessions = new Map();

const CATEGORIES = [
    { id:'main', title:'Main' }, { id:'group', title:'Group' },
    { id:'security', title:'Security' }, { id:'downloader', title:'Downloader' },
    { id:'ai', title:'Ai System' }, { id:'fun', title:'Fun' },
    { id:'media', title:'Media' }, { id:'chat', title:'Chat' },
    { id:'owner', title:'Owner' }
];

const NAME_CATEGORY = {
    alive:'main', ping:'main', runtime:'main', uptime:'main', owner:'main', menu:'main', help:'main',
    kick:'group', add:'group', promote:'group', demote:'group', tagall:'group', hidetag:'group',
    admins:'group', members:'group', groupinfo:'group', mute:'group', unmute:'group',
    antilink:'security', antispam:'security', antiflood:'security', antibot:'security',
    antibad:'security', welcome:'security', goodbye:'security', warn:'security',
    warnings:'security', resetwarn:'security', antidelete:'security', antiedit:'security',
    fb:'downloader', facebook:'downloader', yt:'downloader', youtube:'downloader',
    tt:'downloader', tiktok:'downloader', ig:'downloader', instagram:'downloader', song:'downloader',
    ai:'ai', gpt:'ai', imagine:'ai', translate:'ai', summarize:'ai', explain:'ai', code:'ai',
    joke:'fun', fact:'fun', quote:'fun', ship:'fun', truth:'fun', dare:'fun', flip:'fun', roll:'fun',
    sticker:'media', s:'media', toimg:'media', take:'media', tourl:'media', image:'media',
    chreact:'chat', autoreply:'chat', chatreact:'chat', react:'chat',
    restart:'owner', shutdown:'owner', broadcast:'owner', setprefix:'owner', block:'owner', unblock:'owner'
};

const FONT = {
    a:'𝒂',b:'𝒃',c:'𝒄',d:'𝒅',e:'𝒆',f:'𝒇',g:'𝒈',h:'𝒉',i:'𝒊',j:'𝒋',k:'𝒌',l:'𝒍',m:'𝒎',
    n:'𝒏',o:'𝒐',p:'𝒑',q:'𝒒',r:'𝒓',s:'𝒔',t:'𝒕',u:'𝒖',v:'𝒗',w:'𝒘',x:'𝒙',y:'𝒚',z:'𝒛',
    A:'𝑨',B:'𝑩',C:'𝑪',D:'𝑫',E:'𝑬',F:'𝑭',G:'𝑮',H:'𝑯',I:'𝑰',J:'𝑱',K:'𝑲',L:'𝑳',M:'𝑴',
    N:'𝑵',O:'𝑶',P:'𝑷',Q:'𝑸',R:'𝑹',S:'𝑺',T:'𝑻',U:'𝑼',V:'𝑽',W:'𝑾',X:'𝑿',Y:'𝒀',Z:'𝒁'
};
const fancy = s => String(s).split('').map(c => FONT[c] || c).join('');

function scanPlugins() {
    const data = Object.fromEntries(CATEGORIES.map(c => [c.id, []]));
    for (const file of fs.readdirSync(__dirname).filter(x => x.endsWith('.js') && x !== path.basename(__filename))) {
        try {
            const p = require(path.join(__dirname, file));
            if (!p || typeof p.execute !== 'function') continue;
            const name = String(p.name || path.basename(file, '.js'));
            const explicit = String(p.category || '').toLowerCase();
            const cat = NAME_CATEGORY[name.toLowerCase()] ||
                (CATEGORIES.find(c => c.id === explicit || c.title.toLowerCase() === explicit)?.id) || 'main';
            data[cat].push(name);
        } catch (e) { console.error('[ZARA MENU]', file, e.message); }
    }
    Object.values(data).forEach(a => a.sort((x,y) => x.localeCompare(y)));
    return data;
}

function keyOf(ctx) { return `${ctx.number || 'bot'}:${ctx.from || ''}:${ctx.sender || ''}`; }

function contextOf(msg) {
    const m = msg?.message || {};
    return m.extendedTextMessage?.contextInfo || m.listResponseMessage?.contextInfo ||
        m.buttonsResponseMessage?.contextInfo || m.templateButtonReplyMessage?.contextInfo ||
        m.interactiveResponseMessage?.contextInfo ||
        m.ephemeralMessage?.message?.extendedTextMessage?.contextInfo ||
        m.ephemeralMessage?.message?.listResponseMessage?.contextInfo ||
        m.viewOnceMessage?.message?.extendedTextMessage?.contextInfo ||
        m.viewOnceMessage?.message?.listResponseMessage?.contextInfo ||
        m.viewOnceMessageV2?.message?.extendedTextMessage?.contextInfo ||
        m.viewOnceMessageV2?.message?.listResponseMessage?.contextInfo || null;
}

function logoInfo() {
    return { externalAdReply: {
        title:'Queen Zara', body:'Sirimath Dev', mediaType:1,
        thumbnailUrl:SMALL_LOGO, renderLargerThumbnail:false, showAdAttribution:false
    }};
}

function listMessage(title, body, buttonText, rows) {
    return {
        text:body, title, footer:'© Sirimath Dev 💋', buttonText,
        sections:[{ title:'QUEEN ZARA', rows }],
        contextInfo:logoInfo()
    };
}

function mainCaption(prefix) {
    return [
        '—(🌟) Enjoy using the Queen Zara script. Please use it wisely.',
        '',
        '╭─❮ 𝑩𝒐𝒕 𝑰𝒏𝒇𝒐 ❯',
        '│ ▣ 𝑵𝒂𝒎𝒆 : Queen Zara',
        '│ ▣ 𝑽𝒆𝒓𝒔𝒊𝒐𝒏 : 1.0.0',
        '│ ▣ 𝑶𝒘𝒏𝒆𝒓 : Sirimath Dev',
        '│ ▣ 𝑺𝒕𝒂𝒕𝒖𝒔 : Online',
        `│ ▣ 𝑷𝒓𝒆𝒇𝒊𝒙 : ${prefix}`,
        '╰━━━━━━━━━━━━━━━━',
        '',
        'Tap the button below to browse commands.',
        '',
        '© 𝑺𝒊𝒓𝒊𝒎𝒂𝒕𝒉 💋'
    ].join('\n');
}

async function sendMain(sock, from, quoted, prefix, key, plugins) {
    try {
        await sock.sendMessage(from, {
            image:{ url:MENU_IMAGE }, caption:mainCaption(prefix), contextInfo:logoInfo()
        }, quoted ? { quoted } : {});
    } catch (e) {
        await sock.sendMessage(from, { text:mainCaption(prefix), contextInfo:logoInfo() }, quoted ? { quoted } : {});
    }

    const rows = CATEGORIES.map((c,i) => ({
        title:`${String(i+1).padStart(2,'0')}  ${c.title}`,
        description:`${plugins[c.id].length} commands`,
        rowId:String(i+1)
    }));
    const sent = await sock.sendMessage(from,
        listMessage('★ QUEEN ZARA ★','Select a category to view its commands.','OPEN MENU',rows),
        quoted ? { quoted } : {}
    );
    if (sent?.key?.id) sessions.set(key, { page:'main', messageId:sent.key.id, expires:Date.now()+TTL });
    return sent;
}

async function sendCategory(sock, from, quoted, catId, prefix, key, plugins) {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return false;
    const commands = plugins[catId] || [];
    const rows = commands.map((name,i) => ({
        title:`${String(i+1).padStart(2,'0')}  ${prefix}${name}`,
        description:`Open ${name} command`, rowId:String(i+1)
    }));
    rows.push({ title:'↩ Back to Main Menu', description:'Return to categories', rowId:'0' });
    const sent = await sock.sendMessage(from,
        listMessage(`★ ${cat.title.toUpperCase()} ★`,
            commands.length ? 'Select a command from the list below.' : 'No commands loaded in this category.',
            'VIEW COMMANDS', rows),
        quoted ? { quoted } : {}
    );
    if (sent?.key?.id) sessions.set(key, {
        page:'category', categoryId:catId, messageId:sent.key.id, expires:Date.now()+TTL
    });
    return sent;
}

module.exports = {
    name:'menu', alias:['help'], desc:'Queen Zara Interactive Button Menu',
    category:'main', reactEmoji:'🍻',

    async execute(sock, msg, args, text, ctx = {}) {
        const from = ctx.from || msg.key.remoteJid;
        const prefix = String(ctx.prefix || ctx.config?.PREFIX || PREFIX);
        const key = keyOf({ ...ctx, from });
        const plugins = scanPlugins();
        const input = (args || []).join(' ').trim().toLowerCase();
        if (/^[1-9]$/.test(input))
            return sendCategory(sock,from,msg,CATEGORIES[Number(input)-1].id,prefix,key,plugins);
        return sendMain(sock,from,msg,prefix,key,plugins);
    },

    async handleReply(sock, msg, text, ctx = {}) {
        const key = keyOf(ctx);
        const session = sessions.get(key);
        if (!session || Date.now() > session.expires) { sessions.delete(key); return false; }
        const quoted = contextOf(msg);
        if (!quoted?.stanzaId || quoted.stanzaId !== session.messageId) return false;
        const value = String(text || '').trim();
        if (!/^\d+$/.test(value)) return false;
        const choice = Number(value);
        const prefix = String(ctx.prefix || ctx.config?.PREFIX || PREFIX);
        const plugins = scanPlugins();

        if (session.page === 'main') {
            if (choice < 1 || choice > CATEGORIES.length) return true;
            await sendCategory(sock,ctx.from,msg,CATEGORIES[choice-1].id,prefix,key,plugins);
            return true;
        }

        if (session.page === 'category') {
            if (choice === 0) {
                await sendMain(sock,ctx.from,msg,prefix,key,plugins);
                return true;
            }
            const commands = plugins[session.categoryId] || [];
            if (choice < 1 || choice > commands.length) return true;
            await sock.sendMessage(ctx.from,{
                text:`▣ Command: ${prefix}${commands[choice-1]}\nType this command to run it.`
            },{ quoted:msg });
            return true;
        }
        return false;
    }
};
