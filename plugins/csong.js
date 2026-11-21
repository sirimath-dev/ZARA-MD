'use strict';

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'csong',
    alias: ['channel-song'],

    async execute(socket, msg, args, text, ctx) {
        const { from } = ctx;

        const react = async (emoji) => {
            try {
                await socket.sendMessage(from, {
                    react: { text: emoji, key: msg.key }
                });
            } catch (e) {}
        };

        const target = args[0];

        if (!target) {
            return socket.sendMessage(from, {
                text: `🎵 *QUEEN ZARA CHANNEL SONG*

*Usage:*

1. JID Method:
\`.csong 123456789@newsletter\`

2. Link Method:
\`.csong https://whatsapp.com/channel/XXXXXXXX\`

📌 Reply to an audio file with the command.`
            }, { quoted: msg });
        }

        const quoted =
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const audio = quoted?.audioMessage || msg.message?.audioMessage;

        if (!audio) {
            return socket.sendMessage(from, {
                text: '🎵 *Reply to an audio file with .csong*'
            }, { quoted: msg });
        }

        try {
            await react('⏳');

            let channelJid = target;

            // Resolve invite link to Channel JID
            if (target.includes('whatsapp.com/channel/')) {
                const match = target.match(
                    /whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/
                );

                if (!match) {
                    throw new Error('Invalid channel invite link');
                }

                if (typeof socket.newsletterMetadata !== 'function') {
                    throw new Error('Channel metadata lookup is not supported');
                }

                const metadata = await socket.newsletterMetadata(
                    'invite',
                    match[1]
                );

                channelJid = metadata.id;
            }

            if (!/^\d+@newsletter$/.test(channelJid)) {
                throw new Error('Invalid Channel JID');
            }

            const stream = await downloadContentFromMessage(
                audio,
                'audio'
            );

            const chunks = [];

            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            const buffer = Buffer.concat(chunks);

            if (!buffer.length) {
                throw new Error('Empty audio file');
            }

            await socket.sendMessage(channelJid, {
                audio: buffer,
                mimetype: audio.mimetype || 'audio/mpeg',
                ptt: false
            });

            await react('🤍');

            await socket.sendMessage(from, {
                text: `✅ *SONG UPLOADED SUCCESSFULLY!*

🎵 *Type:* AUDIO
📢 *Channel:* \`${channelJid}\`
🟢 *Status:* \`SUCCESS\`

🤍 *QUEEN ZARA*`
            }, { quoted: msg });

        } catch (error) {
            console.error('CSONG ERROR:', error);

            await react('❌');

            await socket.sendMessage(from, {
                text: `❌ *UPLOAD FAILED!*

${error.message}

Check the Channel JID / Invite Link and bot admin permissions.`
            }, { quoted: msg });
        }
    }
};
