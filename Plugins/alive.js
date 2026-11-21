'use strict';

const os = require('os');
const moment = require('moment-timezone');

module.exports = {
    name: 'alive',
    alias: ['status', 'online'],

    async execute(socket, msg, args, text, ctx) {
        const { from, config } = ctx;

        const start = Date.now();

        const formatUptime = (seconds) => {
            const d = Math.floor(seconds / 86400);
            const h = Math.floor((seconds % 86400) / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);

            return `${d}d ${h}h ${m}m ${s}s`;
        };

        const uptime = formatUptime(process.uptime());

        const memory = process.memoryUsage();
        const ram = (memory.rss / 1024 / 1024).toFixed(2);

        const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

        const platform = os.platform();
        const nodeVersion = process.version;

        const time = moment()
            .tz('Asia/Colombo')
            .format('DD MMM YYYY | hh:mm:ss A');

        const botName = config.BOT_NAME || 'QUEEN ZARA';
        const footer = config.BOT_FOOTER || 'SIRIMATH DEV </>';

        const ping = Date.now() - start;

        const caption = `
╭━━〔 👑 𝐐𝐔𝐄𝐄𝐍 𝐙𝐀𝐑𝐀 〕━━╮

       ✨ 𝐈'𝐌 𝐀𝐋𝐈𝐕𝐄 𝐍𝐎𝐖 ✨

╭───────────────
│ 🟢 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝐎𝐍𝐋𝐈𝐍𝐄
│ 🤖 𝐁𝐨𝐭 : ${botName}
│ ⚡ 𝐏𝐢𝐧𝐠 : ${ping} ms
│ ⏱️ 𝐔𝐩𝐭𝐢𝐦𝐞 : ${uptime}
╰───────────────

╭━━〔 💻 𝐒𝐘𝐒𝐓𝐄𝐌 〕━━╮
│ 🧠 𝐑𝐀𝐌 : ${ram} MB
│ 💾 𝐓𝐨𝐭𝐚𝐥 : ${totalRAM} GB
│ ⚙️ 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦 : ${platform}
│ 📦 𝐍𝐨𝐝𝐞 : ${nodeVersion}
╰────────────────

╭━━〔 🕒 𝐋𝐎𝐂𝐀𝐋 𝐓𝐈𝐌𝐄 〕━━╮
│ 🇱🇰 ${time}
╰────────────────

╭━━〔 👑 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 〕━━╮
│ 💎 𝐒𝐈𝐑𝐈𝐌𝐀𝐓𝐇 𝐃𝐄𝐕 </>
│ 🦋 𝐐𝐔𝐄𝐄𝐍 𝐙𝐀𝐑𝐀
╰────────────────

       ♛ 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐒𝐈𝐑𝐈𝐌𝐀𝐓𝐇 ♛

> ${footer}
`;

        const logo = config.RCD_IMAGE_PATH;

        if (logo) {
            try {
                await socket.sendMessage(
                    from,
                    {
                        image: { url: logo },
                        caption
                    },
                    { quoted: msg }
                );
                return;
            } catch (e) {}
        }

        await socket.sendMessage(
            from,
            { text: caption },
            { quoted: msg }
        );
    }
};
