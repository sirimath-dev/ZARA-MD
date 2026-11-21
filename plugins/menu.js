const config = require('../config');

const LOGO = 'https://files.catbox.moe/29hxc2.jpg';
const FOOTER = '© 𝑺𝒊𝒓𝒊𝒎𝒂𝒕𝒉 💋';

const SESSION_TIME = 5 * 60 * 1000;
const sessions = new Map();

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MENU CATEGORIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const CATEGORIES = {

    '1': {
        title: 'MAIN MENU',
        description: 'Basic bot commands',
        commands: [
            ['alive', 'Check bot status'],
            ['ping', 'Check bot speed'],
            ['runtime', 'Bot uptime'],
            ['owner', 'Owner information'],
            ['menu', 'Show main menu']
        ]
    },

    '2': {
        title: 'GROUP MENU',
        description: 'Group management commands',
        commands: [
            ['kick', 'Remove a member'],
            ['add', 'Add a member'],
            ['promote', 'Promote to admin'],
            ['demote', 'Remove admin'],
            ['tagall', 'Tag all members'],
            ['hidetag', 'Hidden tag all'],
            ['admins', 'Show group admins'],
            ['members', 'Show group members'],
            ['groupinfo', 'Group information']
        ]
    },

    '3': {
        title: 'SECURITY MENU',
        description: 'Group security commands',
        commands: [
            ['antilink on/off', 'Anti link system'],
            ['antispam on/off', 'Anti spam system'],
            ['antiflood on/off', 'Anti flood system'],
            ['antibot on/off', 'Anti bot system'],
            ['antibad on/off', 'Bad word filter'],
            ['welcome on/off', 'Welcome messages'],
            ['goodbye on/off', 'Goodbye messages'],
            ['warn', 'Warn a member'],
            ['warnings', 'Check warnings'],
            ['resetwarn', 'Reset warnings']
        ]
    },

    '4': {
        title: 'DOWNLOADER MENU',
        description: 'Download commands',
        commands: [
            ['fb', 'Facebook downloader'],
            ['yt', 'YouTube downloader'],
            ['tt', 'TikTok downloader'],
            ['ig', 'Instagram downloader'],
            ['song', 'Music downloader']
        ]
    },

    '5': {
        title: 'AI SYSTEM',
        description: 'Artificial intelligence commands',
        commands: [
            ['ai', 'AI assistant'],
            ['gpt', 'ChatGPT assistant'],
            ['imagine', 'AI image generation'],
            ['translate', 'Language translator'],
            ['summarize', 'Text summarizer'],
            ['explain', 'Explain anything'],
            ['code', 'Coding assistant']
        ]
    },

    '6': {
        title: 'FUN MENU',
        description: 'Entertainment commands',
        commands: [
            ['joke', 'Random jokes'],
            ['fact', 'Random facts'],
            ['quote', 'Motivational quotes'],
            ['ship', 'Love compatibility'],
            ['truth', 'Truth game'],
            ['dare', 'Dare game'],
            ['flip', 'Coin flip'],
            ['roll', 'Dice roll']
        ]
    },

    '7': {
        title: 'MEDIA MENU',
        description: 'Media tools',
        commands: [
            ['sticker', 'Create sticker'],
            ['toimg', 'Sticker to image'],
            ['take', 'Change sticker name'],
            ['tourl', 'Media to URL']
        ]
    },

    '8': {
        title: 'CHAT MENU',
        description: 'Chat automation',
        commands: [
            ['chreact', 'Chat reactions'],
            ['autoreply', 'Auto reply settings'],
            ['antidelete', 'Anti delete system'],
            ['welcome', 'Welcome settings'],
            ['goodbye', 'Goodbye settings']
        ]
    },

    '9': {
        title: 'OWNER MENU',
        description: 'Bot owner commands',
        commands: [
            ['restart', 'Restart bot'],
            ['shutdown', 'Stop bot'],
            ['broadcast', 'Broadcast message'],
            ['setprefix', 'Change bot prefix'],
            ['block', 'Block a user'],
            ['unblock', 'Unblock a user']
        ]
    }

};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HELPERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function getPrefix(ctx) {
    return String(
        ctx.prefix ||
        ctx.config?.PREFIX ||
        config.PREFIX ||
        '.'
    );
}

function getSessionKey(ctx) {
    return `${ctx.number || ''}:${ctx.from || ''}:${ctx.sender || ''}`;
}

function cleanSessions() {
    const now = Date.now();

    for (const [key, session] of sessions.entries()) {
        if (now - session.time > SESSION_TIME) {
            sessions.delete(key);
        }
    }
}

function getMainMenu(prefix) {
    return `
*👑  QUEEN ZARA*

*▼ MAIN MENU*

01  ▸ *MAIN*
02  ▸ *GROUP*
03  ▸ *SECURITY*
04  ▸ *DOWNLOADER*
05  ▸ *AI SYSTEM*
06  ▸ *FUN*
07  ▸ *MEDIA*
08  ▸ *CHAT*
09  ▸ *OWNER*

*▼ HOW TO USE*

▸ Reply with a menu number.
▸ Reply with *0* to return here.

*▼ PREFIX*
\`${prefix}\`

*▼ STATUS*
\`ONLINE\`

${FOOTER}
`.trim();
}

function getSubMenu(number, prefix) {
    const category = CATEGORIES[number];

    if (!category) return null;

    let commandList = category.commands.map(([command, description]) => {
        return `▸ \`${prefix}${command}\`\n   ${description}`;
    }).join('\n\n');

    return `
*▼ ${category.title}*

_${category.description}_

${commandList}

*▼ NAVIGATION*
▸ Reply *0* to return to Main Menu.

${FOOTER}
`.trim();
}

function getReplyContext(msg) {
    const message = msg.message || {};

    return (
        message.extendedTextMessage?.contextInfo ||
        message.ephemeralMessage?.message?.extendedTextMessage?.contextInfo ||
        message.viewOnceMessage?.message?.extendedTextMessage?.contextInfo ||
        message.viewOnceMessageV2?.message?.extendedTextMessage?.contextInfo ||
        null
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SEND MENU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function sendMenu(sock, from, msg, text, sessionKey, quoted = true) {
    const options = quoted && msg
        ? { quoted: msg }
        : {};

    let sent;

    try {
        sent = await sock.sendMessage(
            from,
            {
                text,
                contextInfo: {
                    externalAdReply: {
                        title: 'QUEEN ZARA',
                        body: 'WhatsApp Automation',
                        thumbnailUrl: LOGO,
                        sourceUrl: LOGO,
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            },
            options
        );
    } catch (error) {
        sent = await sock.sendMessage(
            from,
            { text },
            options
        );
    }

    if (sessionKey && sent?.key?.id) {
        sessions.set(sessionKey, {
            messageId: sent.key.id,
            time: Date.now()
        });
    }

    return sent;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN PLUGIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

module.exports = {

    name: 'menu',

    alias: ['help', 'commands'],

    description: 'Interactive category menu',

    category: 'main',

    async execute(sock, msg, args, text, ctx) {
        try {
            cleanSessions();

            const from = ctx.from || msg.key.remoteJid;
            const prefix = getPrefix(ctx);
            const sessionKey = getSessionKey(ctx);

            const menuText = getMainMenu(prefix);

            await sendMenu(
                sock,
                from,
                msg,
                menuText,
                sessionKey,
                true
            );

        } catch (error) {
            console.error('MENU ERROR:', error);

            await sock.sendMessage(
                ctx.from || msg.key.remoteJid,
                {
                    text: '*❌ MENU ERROR*\n\nUnable to display menu.'
                },
                { quoted: msg }
            );
        }
    },

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       NUMBER REPLY HANDLER
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    async handleReply(sock, msg, text, ctx) {
        try {
            cleanSessions();

            const number = String(text).trim();
            const from = ctx.from;
            const prefix = getPrefix(ctx);
            const sessionKey = getSessionKey(ctx);

            const session = sessions.get(sessionKey);

            if (!session) return false;

            const replyContext = getReplyContext(msg);

            if (!replyContext?.stanzaId) return false;

            // Only accept replies to the latest menu message
            if (replyContext.stanzaId !== session.messageId) {
                return false;
            }

            // Expired session
            if (Date.now() - session.time > SESSION_TIME) {
                sessions.delete(sessionKey);

                await sock.sendMessage(
                    from,
                    {
                        text: '*⌛ MENU EXPIRED*\n\nSend `.menu` to open it again.'
                    },
                    { quoted: msg }
                );

                return true;
            }

            // Return to main menu
            if (number === '0') {
                await sendMenu(
                    sock,
                    from,
                    msg,
                    getMainMenu(prefix),
                    sessionKey,
                    true
                );

                return true;
            }

            // Invalid category
            if (!CATEGORIES[number]) {
                await sock.sendMessage(
                    from,
                    {
                        text: '*⚠️ INVALID OPTION*\n\nReply with a number from *01 - 09* or *0* to go back.'
                    },
                    { quoted: msg }
                );

                return true;
            }

            // Send selected category
            const submenu = getSubMenu(number, prefix);

            await sendMenu(
                sock,
                from,
                msg,
                submenu,
                sessionKey,
                true
            );

            return true;

        } catch (error) {
            console.error('MENU REPLY ERROR:', error);
            return false;
        }
    }

};
