const fs = require('fs');
const path = require('path');
const config = require('../config');

const MENU_IMAGE = 'https://file.dnuz.top/9yp84j.jpg';
const PREFIX = config.PREFIX || '.';
const sessions = new Map();
const SESSION_TTL = 5 * 60 * 1000;

const CATEGORIES = [
    { name: 'Main', commands: ['alive', 'ping', 'runtime', 'owner'] },
    { name: 'Group', commands: ['kick', 'add', 'promote', 'demote', 'tagall', 'hidetag'] },
    { name: 'Security', commands: ['antilink', 'antispam', 'antiflood', 'welcome', 'goodbye', 'warn'] },
    { name: 'Downloader', commands: ['fb', 'yt', 'tt', 'ig', 'song'] },
    { name: 'AI System', commands: ['ai', 'gpt', 'translate', 'imagine', 'code'] },
    { name: 'Fun', commands: ['joke', 'fact', 'quote', 'truth', 'dare'] },
    { name: 'Media', commands: ['sticker', 'toimg', 'take', 'tourl'] },
    { name: 'Chat', commands: ['chreact', 'autoreply', 'antidelete'] },
    { name: 'Owner', commands: ['restart', 'broadcast', 'setprefix', 'block', 'unblock'] }
];

function sessionKey(ctx) {
    return `${ctx.number || 'bot'}:${ctx.from || ''}:${ctx.sender || ''}`;
}

function getQuotedContext(msg) {
    const m = msg?.message || {};
    return m.extendedTextMessage?.contextInfo ||
        m.ephemeralMessage?.message?.extendedTextMessage?.contextInfo ||
        m.viewOnceMessage?.message?.extendedTextMessage?.contextInfo ||
        m.viewOnceMessageV2?.message?.extendedTextMessage?.contextInfo ||
        null;
}

function getPluginCommands() {
    const found = new Map(CATEGORIES.map(category => [category.name, new Set()]));

    try {
        const files = fs.readdirSync(__dirname)
            .filter(file => file.endsWith('.js') && file !== path.basename(__filename));

        for (const file of files) {
            try {
                const plugin = require(path.join(__dirname, file));
                if (!plugin || typeof plugin.execute !== 'function') continue;

                const name = String(plugin.name || path.basename(file, '.js'));
                const explicitCategory = String(plugin.category || '').toLowerCase();
                const category = CATEGORIES.find(item =>
                    item.name.toLowerCase() === explicitCategory
                );
                const fallback = CATEGORIES.find(item =>
                    item.commands.some(command => command.toLowerCase() === name.toLowerCase())
                );

                found.get((category || fallback || CATEGORIES[0]).name).add(name);
            } catch (error) {
                console.error(`[QUEEN ZARA MENU] ${file}: ${error.message}`);
            }
        }
    } catch (error) {
        console.error('[QUEEN ZARA MENU]', error.message);
    }

    return CATEGORIES.map(category => ({
        ...category,
        commands: [...new Set([...category.commands, ...found.get(category.name)])]
            .sort((a, b) => a.localeCompare(b))
    }));
}

function mainMenu(prefix, categories) {
    const lines = [
        '*★ QUEEN ZARA ★*',
        '',
        '*▼ PREFIX*',
        `\`\`\`${prefix}\`\`\``,
        '',
        '*▼ STATUS*',
        '`ONLINE`',
        '',
        '*▼ MAIN MENU*',
        ''
    ];

    categories.forEach((category, index) => {
        lines.push(`*${String(index + 1).padStart(2, '0')}  ▸ ${category.name.toUpperCase()}*`);
    });

    lines.push(
        '',
        '`Reply with a menu number to open a category.`',
        '',
        '*© SIRIMATH DEV*'
    );

    return lines.join('\n');
}

function categoryMenu(category, prefix) {
    const lines = [
        '*★ QUEEN ZARA ★*',
        '',
        `*▼ ${category.name.toUpperCase()} MENU*`,
        ''
    ];

    if (!category.commands.length) {
        lines.push('`No commands found.`');
    } else {
        category.commands.forEach((command, index) => {
            lines.push(`*${String(index + 1).padStart(2, '0')}*  \`${prefix}${command}\``);
        });
    }

    lines.push(
        '',
        '`Reply 0 to return to the main menu.`',
        '',
        '*© SIRIMATH DEV*'
    );

    return lines.join('\n');
}

async function sendMain(sock, from, quoted, prefix, key, categories) {
    const caption = mainMenu(prefix, categories);
    let sent;

    try {
        sent = await sock.sendMessage(from, {
            image: { url: MENU_IMAGE },
            caption
        }, quoted ? { quoted } : {});
    } catch (error) {
        console.error('[QUEEN ZARA MENU IMAGE]', error.message);
        sent = await sock.sendMessage(from, { text: caption }, quoted ? { quoted } : {});
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

async function sendCategory(sock, from, quoted, category, prefix, key) {
    const sent = await sock.sendMessage(from, {
        text: categoryMenu(category, prefix)
    }, quoted ? { quoted } : {});

    if (sent?.key?.id) {
        sessions.set(key, {
            page: 'category',
            messageId: sent.key.id,
            expires: Date.now() + SESSION_TTL
        });
    }

    return sent;
}

module.exports = {
    name: 'menu',
    alias: ['help'],
    desc: 'Queen Zara Simple Menu',
    category: 'main',
    reactEmoji: '🍻',

    async execute(sock, msg, args, text, ctx = {}) {
        const from = ctx.from || msg.key.remoteJid;
        const prefix = String(ctx.prefix || ctx.config?.PREFIX || PREFIX);
        const key = sessionKey({ ...ctx, from });
        const categories = getPluginCommands();
        const choice = String((args || []).join('').trim());

        if (/^[1-9]$/.test(choice)) {
            return sendCategory(sock, from, msg, categories[Number(choice) - 1], prefix, key);
        }

        return sendMain(sock, from, msg, prefix, key, categories);
    },

    async handleReply(sock, msg, text, ctx = {}) {
        const key = sessionKey(ctx);
        const session = sessions.get(key);

        if (!session || Date.now() > session.expires) {
            sessions.delete(key);
            return false;
        }

        const quoted = getQuotedContext(msg);
        if (!quoted?.stanzaId || quoted.stanzaId !== session.messageId) return false;

        const choice = String(text || '').trim();
        if (!/^\d+$/.test(choice)) return false;

        const prefix = String(ctx.prefix || ctx.config?.PREFIX || PREFIX);
        const categories = getPluginCommands();

        if (session.page === 'main') {
            const index = Number(choice) - 1;
            if (index < 0 || index >= categories.length) return false;

            await sendCategory(sock, ctx.from, msg, categories[index], prefix, key);
            return true;
        }

        if (session.page === 'category' && choice === '0') {
            await sendMain(sock, ctx.from, msg, prefix, key, categories);
            return true;
        }

        return false;
    }
};
