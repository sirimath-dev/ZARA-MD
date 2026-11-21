const fs = require('fs');
const path = require('path');
const config = require('../config');

const DEFAULT_PREFIX = config.PREFIX || '.';
const SMALL_LOGO = config.RCD_IMAGE_PATH || 'https://files.catbox.moe/29hxc2.jpg';
const MENU_IMAGE = 'https://file.dnuz.top/9yp84j.jpg';
const SESSION_TTL = 10 * 60 * 1000;
const sessions = new Map();

const CATEGORIES = [
    { id: 'main', title: 'Main' },
    { id: 'group', title: 'Group' },
    { id: 'security', title: 'Security' },
    { id: 'downloader', title: 'Downloader' },
    { id: 'ai', title: 'Ai System' },
    { id: 'fun', title: 'Fun' },
    { id: 'media', title: 'Media' },
    { id: 'chat', title: 'Chat' },
    { id: 'owner', title: 'Owner' }
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
const fancy = value => String(value).split('').map(ch => FONT[ch] || ch).join('');

function scanPlugins() {
    const result = Object.fromEntries(CATEGORIES.map(c => [c.id, []]));
    const files = fs.readdirSync(__dirname).filter(file =>
        file.endsWith('.js') && file !== path.basename(__filename)
    );

    for (const file of files) {
        try {
            const plugin = require(path.join(__dirname, file));
            if (!plugin || typeof plugin.execute !== 'function') continue;

            const name = String(plugin.name || path.basename(file, '.js'));
            const explicit = String(plugin.category || '').toLowerCase().trim();
            let category = NAME_CATEGORY[name.toLowerCase()];

            if (!category) {
                const found = CATEGORIES.find(c => c.id === explicit || c.title.toLowerCase() === explicit);
                category = found ? found.id : 'main';
            }

            result[category].push(name);
        } catch (error) {
            console.log(`[ZARA MENU] ${file}: ${error.message}`);
        }
    }

    for (const list of Object.values(result)) list.sort((a, b) => a.localeCompare(b));
    return result;
}

function getQuotedId(msg) {
    let m = msg?.message;
    for (let i = 0; i < 6 && m; i++) {
        const ctx = m.extendedTextMessage?.contextInfo;
        if (ctx?.stanzaId) return ctx.stanzaId;
        if (m.ephemeralMessage?.message) { m = m.ephemeralMessage.message; continue; }
        if (m.viewOnceMessage?.message) { m = m.viewOnceMessage.message; continue; }
        if (m.viewOnceMessageV2?.message) { m = m.viewOnceMessageV2.message; continue; }
        if (m.viewOnceMessageV2Extension?.message) { m = m.viewOnceMessageV2Extension.message; continue; }
        break;
    }
    return null;
}

function makeTreeMenu(prefix, plugins) {
    const lines = [
        `—(🌟) Enjoy using *Queen Zara*, please use it wisely and be responsible for everything you do.`,
        '',
        '╭─❮ 𝑩𝒐𝒕 𝑰𝒏𝒇𝒐 ❯',
        `│ ▣ 𝑵𝒂𝒎𝒆 : Queen Zara`,
        `│ ▣ 𝑽𝒆𝒓𝒔𝒊𝒐𝒏 : 1.0.0`,
        `│ ▣ 𝑶𝒘𝒏𝒆𝒓 : Sirimath Dev`,
        `│ ▣ 𝑺𝒕𝒂𝒕𝒖𝒔 : Online`,
        `│ ▣ 𝑷𝒓𝒆𝒇𝒊𝒙 : ${prefix}`,
        '╰━━━━━━━━━━━━',
        ''
    ];

    CATEGORIES.forEach((category, index) => {
        const commands = plugins[category.id] || [];
        lines.push(`╭─❮ ${fancy(category.title)} 𝑴𝒆𝒏𝒖 ❯`);
        if (!commands.length) {
            lines.push('│ ▣ No commands loaded');
        } else {
            commands.forEach((name, i) => {
                const last = i === commands.length - 1;
                lines.push(`${last ? '╰' : '│'} ▣ ${prefix}${name}`);
            });
        }
        if (index !== CATEGORIES.length - 1) lines.push('│');
    });

    lines.push(
        '',
        '╭─❮ 𝑯𝒆𝒍𝒑 ❯',
        '│ ▣ Reply with 01 - 09 to open a category',
        '│ ▣ Reply 0 to return to the main menu',
        '╰━━━━━━━━━━━━',
        '',
        '© 𝑺𝒊𝒓𝒊𝒎𝒂𝒕𝒉 💋'
    );
    return lines.join('\n');
}

function makeCategoryMenu(categoryId, plugins, prefix) {
    const category = CATEGORIES.find(c => c.id === categoryId);
    const commands = plugins[categoryId] || [];
    if (!category) return 'Category not found.';

    const lines = [
        `╭─❮ ${fancy(category.title)} 𝑴𝒆𝒏𝒖 ❯`
    ];
    if (!commands.length) lines.push('╰ ▣ No commands loaded');
    else commands.forEach((name, index) => {
        lines.push(`${index === commands.length - 1 ? '╰' : '│'} ▣ ${prefix}${name}`);
    });
    lines.push('', '╭─❮ 𝑵𝒂𝒗𝒊𝒈𝒂𝒕𝒊𝒐𝒏 ❯', '│ ▣ Reply 0 to return', '╰━━━━━━━━━━━━', '', '© 𝑺𝒊𝒓𝒊𝒎𝒂𝒕𝒉 💋');
    return lines.join('\n');
}

function makeContextInfo() {
    return {
        externalAdReply: {
            title: 'Queen Zara Version Premium',
            body: 'Sirimath Dev',
            mediaType: 1,
            thumbnailUrl: SMALL_LOGO,
            renderLargerThumbnail: false,
            showAdAttribution: false
        }
    };
}

async function sendMain(sock, from, quoted, settings, key, plugins) {
    let sent;
    try {
        sent = await sock.sendMessage(from, {
            image: { url: MENU_IMAGE },
            caption: makeTreeMenu(settings.prefix, plugins),
            contextInfo: makeContextInfo()
        }, quoted ? { quoted } : {});
    } catch (error) {
        console.error('[ZARA MENU IMAGE]', error.message);
        sent = await sock.sendMessage(from, {
            text: makeTreeMenu(settings.prefix, plugins),
            contextInfo: makeContextInfo()
        }, quoted ? { quoted } : {});
    }

    if (sent?.key?.id) {
        sessions.set(key, {
            page: 'main',
            messageId: sent.key.id,
            expires: Date.now() + SESSION_TTL
        });
    }
    return sent;
}

async function sendCategory(sock, from, quoted, categoryId, settings, key, plugins) {
    const sent = await sock.sendMessage(from, {
        text: makeCategoryMenu(categoryId, plugins, settings.prefix),
        contextInfo: makeContextInfo()
    }, quoted ? { quoted } : {});

    if (sent?.key?.id) {
        sessions.set(key, {
            page: 'category',
            categoryId,
            messageId: sent.key.id,
            expires: Date.now() + SESSION_TTL
        });
    }
    return sent;
}

function makeKey(ctx) {
    return `${ctx.number || 'bot'}:${ctx.from || ''}:${ctx.sender || ''}`;
}

module.exports = {
    name: 'menu',
    alias: ['help'],
    desc: 'Queen Zara Image Menu',
    category: 'main',
    reactEmoji: '👑',

    async execute(sock, msg, args, text, ctx = {}) {
        const from = ctx.from || msg.key.remoteJid;
        const settings = {
            prefix: String(ctx.prefix || ctx.config?.PREFIX || DEFAULT_PREFIX)
        };
        const key = makeKey({ ...ctx, from });
        const plugins = scanPlugins();
        const input = (args || []).join(' ').trim().toLowerCase();

        if (/^[1-9]$/.test(input)) {
            return sendCategory(sock, from, msg, CATEGORIES[Number(input) - 1].id, settings, key, plugins);
        }
        return sendMain(sock, from, msg, settings, key, plugins);
    },

    async handleReply(sock, msg, text, ctx = {}) {
        const key = makeKey(ctx);
        const session = sessions.get(key);
        if (!session || Date.now() > session.expires) {
            sessions.delete(key);
            return false;
        }
        if (getQuotedId(msg) !== session.messageId) return false;
        if (!/^\d+$/.test(String(text).trim())) return false;

        const choice = Number(String(text).trim());
        const settings = {
            prefix: String(ctx.prefix || ctx.config?.PREFIX || DEFAULT_PREFIX)
        };
        const plugins = scanPlugins();

        if (session.page === 'main') {
            if (choice < 1 || choice > 9) {
                await sock.sendMessage(ctx.from, { text: 'Reply with a number from 1 to 9.' }, { quoted: msg });
                return true;
            }
            await sendCategory(sock, ctx.from, msg, CATEGORIES[choice - 1].id, settings, key, plugins);
            return true;
        }

        if (session.page === 'category') {
            if (choice === 0) {
                await sendMain(sock, ctx.from, msg, settings, key, plugins);
                return true;
            }
            const commands = plugins[session.categoryId] || [];
            if (choice >= 1 && choice <= commands.length) {
                await sock.sendMessage(ctx.from, {
                    text: `▣ Command: ${settings.prefix}${commands[choice - 1]}\nType the command above to run it.`
                }, { quoted: msg });
                return true;
            }
            await sock.sendMessage(ctx.from, { text: 'Invalid number. Reply 0 to return.' }, { quoted: msg });
            return true;
        }
        return false;
    }
};
