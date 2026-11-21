const config = require('../config');

const PREFIX = config.PREFIX || '.';
const LOGO = 'https://files.catbox.moe/29hxc2.jpg';

module.exports = {
    name: 'menu',
    alias: ['help', 'commands', 'list'],
    desc: 'Queen Zara Premium Menu',
    category: 'main',

    async execute(sock, msg, args, text, ctx = {}) {

        const from = ctx.from || msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const pushName = msg.pushName || 'User';

        const date = new Date();

        const time = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Colombo',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);

        const today = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Colombo',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(date);

        const number = sender.split(':')[0].split('@')[0];

        const menu = `
╭────────────────────╮
│
│       👑 QUEEN ZARA
│
│   PREMIUM WHATSAPP BOT
│
├────────────────────
│
│  USER    : ${pushName}
│  NUMBER  : ${number}
│  DATE    : ${today}
│  TIME    : ${time}
│  PREFIX  : ${PREFIX}
│
╰────────────────────

╭──────〔 MAIN 〕──────

│  ◦ ${PREFIX}alive
│  ◦ ${PREFIX}ping
│  ◦ ${PREFIX}runtime
│  ◦ ${PREFIX}owner
│  ◦ ${PREFIX}menu

╰────────────────────

╭─────〔 GROUP 〕─────

│  ◦ ${PREFIX}kick
│  ◦ ${PREFIX}add
│  ◦ ${PREFIX}promote
│  ◦ ${PREFIX}demote
│  ◦ ${PREFIX}tagall
│  ◦ ${PREFIX}hidetag
│  ◦ ${PREFIX}admins
│  ◦ ${PREFIX}members
│  ◦ ${PREFIX}groupinfo

╰────────────────────

╭────〔 SECURITY 〕────

│  ◦ ${PREFIX}antilink on/off
│  ◦ ${PREFIX}antispam on/off
│  ◦ ${PREFIX}antiflood on/off
│  ◦ ${PREFIX}antibot on/off
│  ◦ ${PREFIX}antibad on/off
│  ◦ ${PREFIX}warn
│  ◦ ${PREFIX}warnings
│  ◦ ${PREFIX}resetwarn

╰────────────────────

╭───〔 DOWNLOADER 〕───

│  ◦ ${PREFIX}fb
│  ◦ ${PREFIX}yt
│  ◦ ${PREFIX}tt
│  ◦ ${PREFIX}ig
│  ◦ ${PREFIX}song

╰────────────────────

╭──────〔 AI 〕───────

│  ◦ ${PREFIX}ai
│  ◦ ${PREFIX}gpt
│  ◦ ${PREFIX}imagine
│  ◦ ${PREFIX}translate
│  ◦ ${PREFIX}summarize

╰────────────────────

╭──────〔 FUN 〕──────

│  ◦ ${PREFIX}joke
│  ◦ ${PREFIX}fact
│  ◦ ${PREFIX}quote
│  ◦ ${PREFIX}ship
│  ◦ ${PREFIX}truth
│  ◦ ${PREFIX}dare
│  ◦ ${PREFIX}flip
│  ◦ ${PREFIX}roll

╰────────────────────

╭──────〔 MEDIA 〕─────

│  ◦ ${PREFIX}sticker
│  ◦ ${PREFIX}toimg
│  ◦ ${PREFIX}take
│  ◦ ${PREFIX}tourl

╰────────────────────

╭──────〔 CHAT 〕─────

│  ◦ ${PREFIX}chreact
│  ◦ ${PREFIX}autoreply
│  ◦ ${PREFIX}antidelete
│  ◦ ${PREFIX}welcome
│  ◦ ${PREFIX}goodbye

╰────────────────────

╭──────〔 OWNER 〕────

│  ◦ ${PREFIX}restart
│  ◦ ${PREFIX}shutdown
│  ◦ ${PREFIX}broadcast
│  ◦ ${PREFIX}setprefix
│  ◦ ${PREFIX}block
│  ◦ ${PREFIX}unblock

╰────────────────────

     𝑸𝒖𝒆𝒆𝒏 𝒁𝒂𝒓𝒂 . © 𝑺𝒊𝒓𝒊𝒎𝒂𝒕𝒉 💋
`;

        try {
            await sock.sendMessage(
                from,
                {
                    image: { url: LOGO },
                    caption: menu
                },
                { quoted: msg }
            );
        } catch (error) {
            console.error('[QUEEN ZARA MENU]', error);

            await sock.sendMessage(
                from,
                { text: menu },
                { quoted: msg }
            );
        }
    }
};
