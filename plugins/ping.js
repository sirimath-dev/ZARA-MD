'use strict';

module.exports = {
    name: 'ping',
    alias: ['speed', 'latency'],

    async execute(socket, msg, args, text, ctx) {
        const { from } = ctx;

        // React to command
        try {
            await socket.sendMessage(from, {
                react: {
                    text: '🏓',
                    key: msg.key
                }
            });
        } catch (e) {}

        // Calculate response time
        const start = Date.now();

        const sent = await socket.sendMessage(
            from,
            { text: '🏓 *Pinging...*' },
            { quoted: msg }
        );

        const ping = Date.now() - start;

        const caption = `
🏓 *PONG!*

⚡ *Speed:* \`${ping} ms\`
🟢 *Status:* \`ONLINE\`
🚀 *Performance:* \`ACTIVE\`

✨ *QUEEN ZARA is running perfectly!*`;

        await socket.sendMessage(
            from,
            { text: caption, edit: sent.key }
        );
    }
};
