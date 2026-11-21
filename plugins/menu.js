const fs = require('fs');
const path = require('path');
const config = require('../config');

const DEFAULT_PREFIX = config.PREFIX || '.';
const DEFAULT_LOGO = config.RCD_IMAGE_PATH || 'https://files.catbox.moe/29hxc2.jpg';
const MENU_IMAGE = 'https://file.dnuz.top/9yp84j.jpg';
const FOOTER = 'Sirimath';
const SESSION_TTL = 10 * 60 * 1000;
const sessions = new Map();

/* Queen Zara font: Capital first letter, remaining letters small. */
const FONT = {
    a:'𝒂',b:'𝒃',c:'𝒄',d:'𝒅',e:'𝒆',f:'𝒇',g:'𝒈',
    h:'𝒉',i:'𝒊',j:'𝒋',k:'𝒌',l:'𝒍',m:'𝒎',n:'𝒏',
    o:'𝒐',p:'𝒑',q:'𝒒',r:'𝒓',s:'𝒔',t:'𝒕',u:'𝒖',
    v:'𝒗',w:'𝒘',x:'𝒙',y:'𝒚',z:'𝒛',
    A:'𝑨',B:'𝑩',C:'𝑪',D:'𝑫',E:'𝑬',F:'𝑭',G:'𝑮',
    H:'𝑯',I:'𝑰',J:'𝑱',K:'𝑲',L:'𝑳',M:'𝑴',N:'𝑵',
    O:'𝑶',P:'𝑷',Q:'𝑸',R:'𝑹',S:'𝑺',T:'𝑻',U:'𝑼',
    V:'𝑽',W:'𝑾',X:'𝑿',Y:'𝒀',Z:'𝒁'
};
const f = value => String(value).split('').map(ch => FONT[ch] || ch).join('');

const CATEGORIES = [
    { id: 'main', title: 'Main', names: ['main','general','system','info'] },
    { id: 'group', title: 'Group', names: ['group','groups','admin','moderation'] },
    { id: 'security', title: 'Security', names: ['security','protection','protect'] },
    { id: 'downloader', title: 'Downloader', names: ['download','downloader'] },
    { id: 'ai', title: 'Ai System', names: ['ai','artificial-intelligence'] },
    { id: 'fun', title: 'Fun', names: ['fun','games','game'] },
    { id: 'media', title: 'Media', names: ['media','sticker','image','video'] },
    { id: 'chat', title: 'Chat', names: ['chat','conversation','reaction'] },
    { id: 'owner', title: 'Owner', names: ['owner','owners','developer'] }
];

const CATEGORY_EMOJI = {
    main: '🏠', group: '👥', security: '🛡️', downloader: '📥',
    ai: '🤖', fun: '🎮', media: '🎨', chat: '💬', owner: '👑'
};

const NAME_CATEGORY = {
    alive:'main', ping:'main', runtime:'main', uptime:'main', owner:'main', menu:'main', help:'main',
    kick:'group', add:'group', promote:'group', demote:'group', tagall:'group',
    hidetag:'group', admins:'group', members:'group', groupinfo:'group', mute:'group', unmute:'group',
    antilink:'security', antispam:'security', antiflood:'security', antibot:'security',
    antibad:'security', welcome:'security', goodbye:'security', warn:'security',
    warnings:'security', resetwarn:'security', antidelete:'security', antiedit:'security',
    fb:'downloader', facebook:'downloader', yt:'downloader', youtube:'downloader',
    tt:'downloader', tiktok:'downloader', ig:'downloader', instagram:'downloader', song:'downloader',
    ai:'ai', gpt:'ai', imagine:'ai', translate:'ai', summarize:'ai', explain:'ai', code:'ai',
    joke:'fun', fact:'fun', quote:'fun', ship:'fun', truth:'fun', dare:'fun', flip:'fun', roll:'fun',
    sticker:'media', s:'media', toimg:'media', take:'media', tourl:'media', image:'media',
    chreact:'chat', autoreply:'chat', chatreact:'chat', react:'chat',
    restart:'owner', shutdown:'owner', broadcast:'owner', setprefix:'owner',
    block:'owner', unblock:'owner'
};

function getCategory(plugin) {
    const name = String(plugin.name || '').toLowerCase();
    if (NAME_CATEGORY[name]) return NAME_CATEGORY[name];

    const raw = String(plugin.category || '').toLowerCase().trim();
    const match = CATEGORIES.find(c => c.id === raw || c.names.includes(raw));
    return match ? match.id : 'main';
}

function scanPlugins() {
    const output = Object.fromEntries(CATEGORIES.map(c => [c.id, []]));
    const pluginDir = __dirname;

    let files = [];
    try {
        files = fs.readdirSync(pluginDir)
            .filter(file => file.endsWith('.js') && file !== path.basename(__filename));
    } catch (e) {
        console.error('[QUEEN ZARA MENU] Cannot read plugins folder:', e.message);
        return output;
    }

    for (const file of files) {
        try {
            const pluginPath = path.join(pluginDir, file);
            const plugin = require(pluginPath);
            if (!plugin || typeof plugin.execute !== 'function') continue;

            const name = String(plugin.name || path.basename(file, '.js'));
            const category = getCategory({ ...plugin, name });
            output[category].push({ name, reactEmoji: plugin.reactEmoji || null });
        } catch (e) {
            console.error(`[QUEEN ZARA MENU] ${file}:`, e.message);
        }
    }

    for (const list of Object.values(output)) {
        list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return output;
}

function buildMainMenu(prefix) {
    const lines = [
        `╭━━━〔 👑 ${f('Queen Zara')} 👑 〕━━━╮`,
        `│ ✨ ${f('Welcome to the menu!')}`,
        `╰━━━━━━━━━━━━━━━━━━╯`,
        '',
        `📌 *${f('Prefix')}*`,
        `\`${prefix}\``,
        '',
        `🟢 *${f('Status')}*  ·  \`${f('Online')}\``,
        '',
        `📚 *${f('Main Menu')}*`,
        ''
    ];

    CATEGORIES.forEach((category, index) => {
        const number = String(index + 1).padStart(2, '0');
        lines.push(`${number}  ${CATEGORY_EMOJI[category.id] || '🔹'}  *${f(category.title)}*`);
    });

    lines.push(
        '',
        ``,
        `💡 \`${f('Reply with a menu number.') }\``,
        ``,
        `╭──────────────────╮`,
        `      💠 ${f(FOOTER)} 💠`,
        `╰──────────────────╯`
    );
    return lines.join('\n');
}

function buildCategoryMenu(categoryId, plugins, prefix) {
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (!category) return 'Category not found.';

    const commands = plugins[categoryId] || [];
    const lines = [
        `╭━━━〔 ${CATEGORY_EMOJI[categoryId] || '🔹'} ${f(category.title)} 〕━━━╮`,
        `│ ✨ ${f('Available Commands')}`,
        `╰━━━━━━━━━━━━━━━━━━━━╯`,
        ''
    ];

    if (!commands.length) {
        lines.push(`▸ ${f('No commands found in this category.')}`);
    } else {
        commands.forEach((plugin, index) => {
            const number = String(index + 1).padStart(2, '0');
            lines.push(`${number}  ⚡ \`${prefix}${plugin.name}\``);
        });
    }

    lines.push(
        '',
        ``,
        `↩️ \`${f('Reply 0 to return to Main Menu.')}\``,
        ``,
        `💠 ${f(FOOTER)} 💠`
    );
    return lines.join('\n');
}

function buildAllMenu(plugins, prefix) {
    const lines = [`╭━━━〔 👑 ${f('Queen Zara')} 〕━━━╮`, `│ 📜 ${f('All Commands')}`, `╰━━━━━━━━━━━━━━━━━━━━╯`, ''];
    for (const category of CATEGORIES) {
        lines.push(`${CATEGORY_EMOJI[category.id] || '🔹'} *${f(category.title)}*`);
        const commands = plugins[category.id] || [];
        if (!commands.length) lines.push('▸ -');
        else for (const item of commands) lines.push(`⚡ \`${prefix}${item.name}\``);
        lines.push('');
    }
    lines.push(`💠 ${f(FOOTER)} 💠`);
    return lines.join('\n');
}

function getQuotedMessageId(msg) {
    let content = msg && msg.message;
    for (let i = 0; i < 6 && content; i++) {
        if (content.extendedTextMessage?.contextInfo?.stanzaId) {
            return content.extendedTextMessage.contextInfo.stanzaId;
        }
        if (content.ephemeralMessage?.message) {
            content = content.ephemeralMessage.message;
            continue;
        }
        if (content.viewOnceMessage?.message) {
            content = content.viewOnceMessage.message;
            continue;
        }
        if (content.viewOnceMessageV2?.message) {
            content = content.viewOnceMessageV2.message;
            continue;
        }
        if (content.viewOnceMessageV2Extension?.message) {
            content = content.viewOnceMessageV2Extension.message;
            continue;
        }
        break;
    }
    return null;
}

function sessionKey(ctx) {
    return `${ctx.number || 'bot'}:${ctx.from || ''}:${ctx.sender || ''}`;
}

async function sendMainMenu(sock, from, quotedMsg, settings, key) {
    const opts = quotedMsg ? { quoted: quotedMsg } : {};

    // First message: the small Queen Zara logo.
    try {
        await sock.sendMessage(from, { image: { url: settings.logo } }, opts);
    } catch (e) {
        console.error('[QUEEN ZARA LOGO]', e.message);
    }

    // Second message: the requested menu picture with the menu caption.
    let sent;
    try {
        sent = await sock.sendMessage(from, {
            image: { url: MENU_IMAGE },
            caption: buildMainMenu(settings.prefix)
        }, opts);
    } catch (e) {
        console.error('[QUEEN ZARA MENU IMAGE]', e.message);
        sent = await sock.sendMessage(from, {
            text: buildMainMenu(settings.prefix)
        }, opts);
    }

    if (key && sent?.key?.id) {
        sessions.set(key, {
            page: 'main',
            messageId: sent.key.id,
            expires: Date.now() + SESSION_TTL
        });
    }
    return sent;
}

async function sendCategoryMenu(sock, from, quotedMsg, categoryId, plugins, settings, key) {
    const sent = await sock.sendMessage(from, {
        text: buildCategoryMenu(categoryId, plugins, settings.prefix)
    }, quotedMsg ? { quoted: quotedMsg } : {});

    if (key && sent?.key?.id) {
        sessions.set(key, {
            page: 'category',
            categoryId,
            messageId: sent.key.id,
            expires: Date.now() + SESSION_TTL
        });
    }
    return sent;
}

module.exports = {
    name: 'menu',
    alias: ['help'],
    desc: 'Queen Zara Interactive Menu',
    category: 'main',
    reactEmoji: '💋',

    async execute(sock, msg, args, text, ctx = {}) {
        const from = ctx.from || msg.key.remoteJid;
        const sender = ctx.sender || msg.key.participant || from;
        const cfg = ctx.config || {};
        const settings = {
            prefix: String(ctx.prefix || cfg.PREFIX || DEFAULT_PREFIX),
            logo: String(cfg.RCD_IMAGE_PATH || DEFAULT_LOGO)
        };
        const key = sessionKey({ ...ctx, from, sender });
        const input = (args || []).join(' ').trim().toLowerCase();
        const plugins = scanPlugins();

        const directCategory = CATEGORIES.find(c =>
            c.id === input || c.title.toLowerCase() === input
        );

        if (input === 'all') {
            sessions.delete(key);
            return sock.sendMessage(from, {
                text: buildAllMenu(plugins, settings.prefix)
            }, { quoted: msg });
        }

        if (directCategory) {
            return sendCategoryMenu(sock, from, msg, directCategory.id, plugins, settings, key);
        }

        if (/^[1-9]$/.test(input)) {
            const category = CATEGORIES[Number(input) - 1];
            return sendCategoryMenu(sock, from, msg, category.id, plugins, settings, key);
        }

        return sendMainMenu(sock, from, msg, settings, key);
    },

    async handleReply(sock, msg, text, ctx = {}) {
        const key = sessionKey(ctx);
        const session = sessions.get(key);
        if (!session) return false;

        if (Date.now() > session.expires) {
            sessions.delete(key);
            return false;
        }

        const quotedId = getQuotedMessageId(msg);
        if (!quotedId || quotedId !== session.messageId) return false;

        const choice = String(text || '').trim();
        if (!/^\d+$/.test(choice)) return false;

        const cfg = ctx.config || {};
        const settings = {
            prefix: String(ctx.prefix || cfg.PREFIX || DEFAULT_PREFIX),
            logo: String(cfg.RCD_IMAGE_PATH || DEFAULT_LOGO)
        };
        const plugins = scanPlugins();

        if (session.page === 'main') {
            const index = Number(choice) - 1;
            if (choice === '0' || index < 0 || index >= CATEGORIES.length) {
                await sock.sendMessage(ctx.from, {
                    text: `⚠️ ${f('Please reply with a number from 1 to 9.')}`
                }, { quoted: msg });
                return true;
            }

            return !!(await sendCategoryMenu(
                sock, ctx.from, msg, CATEGORIES[index].id, plugins, settings, key
            ));
        }

        if (session.page === 'category') {
            if (choice === '0') {
                return !!(await sendMainMenu(sock, ctx.from, msg, settings, key));
            }

            const commands = plugins[session.categoryId] || [];
            const index = Number(choice) - 1;
            if (index >= 0 && index < commands.length) {
                const command = commands[index].name;
                await sock.sendMessage(ctx.from, {
                    text: `✨ ${f('Selected Command')} ✨\n\n⚡ \`${settings.prefix}${command}\`\n\n💡 ${f('Type this command to use it.')}`
                }, { quoted: msg });
                return true;
            }

            await sock.sendMessage(ctx.from, {
                text: `⚠️ ${f('Invalid number. Reply 0 to go back.')}`
            }, { quoted: msg });
            return true;
        }

        return false;
    }
};
