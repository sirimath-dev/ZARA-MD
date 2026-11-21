'use strict';

module.exports = {
    name: 'owner',
    alias: ['dev', 'creator'],

    async execute(socket, msg, args, text, ctx) {
        const { from } = ctx;

        try {
            await socket.sendMessage(from, {
                react: {
                    text: '💀',
                    key: msg.key
                }
            });
        } catch (e) {}

        const number = '94740430151';

        const caption = `
👑 *QUEEN ZARA — OWNER*

╭─「 💎 OWNER DETAILS 」
│
│ 👤 *Name:* \`SIRIMATH DEV </>\`
│ 📱 *WhatsApp:* \`+94 740 430 151\`
│ 🌐 *Country:* Sri Lanka 🇱🇰
│
╰──────────────

✨ *DEVELOPER & CREATOR*
⚡ *QUEEN ZARA DEV*

🤍 *Thanks for using QUEEN ZARA!*
`;

        await socket.sendMessage(
            from,
            {
                text: caption,
                footer: 'QUEEN ZARA',
                templateButtons: [
                    {
                        index: 1,
                        urlButton: {
                            displayText: '💬 SIRIMATH',
                            url: `https://wa.me/${number}`
                        }
                    }
                ]
            },
            { quoted: msg }
        );
    }
};
