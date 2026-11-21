'use strict';

module.exports = {
    name: 'alive',
    alias: ['status'],

    async execute(socket, msg, args, text, ctx) {
        const { from, config } = ctx;

        // React to command message
        try {
            await socket.sendMessage(from, {
                react: {
                    text: '🍻',
                    key: msg.key
                }
            });
        } catch (e) {}

        const uptime = Math.floor(process.uptime());
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const s = uptime % 60;

        const time = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Colombo',
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date());

        const caption = `
👑 *Zara IS ALIVE*

🟢 *Status:* \`ONLINE\`
⚡ *Uptime:* \`${h}h ${m}m ${s}s\`
🕒 *Time:* \`${time}\`

✨ *Everything is working perfectly!*`;

        const logo = config.RCD_IMAGE_PATH;

        if (logo) {
            try {
                return await socket.sendMessage(
                    from,
                    { image: { url: logo }, caption },
                    { quoted: msg }
                );
            } catch (e) {}
        }

        await socket.sendMessage(
            from,
            { text: caption },
            { quoted: msg }
        );
    }
};
