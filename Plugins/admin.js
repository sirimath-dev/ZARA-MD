const config = require('../config');

/* Small caps helper */
const SC = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
    n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};
const sc = (str) => String(str).toLowerCase().replace(/[a-z]/g, (ch) => SC[ch]);
const getTitle = (cmd) => `${sc(config.BOT_NAME)} </> ${sc(cmd)}`;

/* Forward Context */
function forwardContext() {
    const contextInfo = { forwardingScore: 999, isForwarded: true };
    if (config.NEWSLETTER_JID) {
        contextInfo.forwardedNewsletterMessageInfo = {
            newsletterJid: config.NEWSLETTER_JID,
            newsletterName: config.BOT_NAME,
            serverMessageId: 1
        };
    }
    return contextInfo;
}

module.exports = {
    name: 'admin',
    description: 'Group admin commands',
    category: 'admin',
    alias: ['kick', 'add', 'promote', 'demote', 'warn', 'del'],

    async execute(sock, msg, args, text, ctx = {}) {
        const chatId = msg.key.remoteJid;
        const prefix = ctx.prefix || config.PREFIX || '.';
        const invokedCmd = (text || '').trim().split(' ')[0].replace(prefix, '').toLowerCase();
        const sender = msg.key.participant || msg.key.remoteJid;

        // Group ekakda balanawa
        if (!chatId.endsWith('@g.us')) {
            return sock.sendMessage(chatId, { 
                text: `❌ ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ ɪꜱ ꜰᴏʀ ɢʀᴏᴜᴘꜱ ᴏɴʟʏ.\n\n> ${config.BOT_FOOTER}`, 
                contextInfo: forwardContext() 
            }, { quoted: msg });
        }

        try { await sock.sendMessage(chatId, { react: { text: '⚙️', key: msg.key } }); } catch (e) {}

        // Target user wa hoyagannawa (Mention karala, reply karala, or number eken)
        const quotedContext = msg.message?.extendedTextMessage?.contextInfo;
        const mentioned = quotedContext?.mentionedJid || [];
        const quotedParticipant = quotedContext?.participant;
        
        let target = mentioned[0] || quotedParticipant;

        try {
            /* ---------------- DELETE MESSAGE ---------------- */
            if (invokedCmd === 'del') {
                if (!quotedContext || !quotedContext.stanzaId) {
                    return await sock.sendMessage(chatId, { 
                        text: `❌ ᴘʟᴇᴀꜱᴇ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴍᴇꜱꜱᴀɢᴇ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ᴅᴇʟᴇᴛᴇ.\n\n> ${config.BOT_FOOTER}`,
                        contextInfo: forwardContext()
                    }, { quoted: msg });
                }

                await sock.sendMessage(chatId, { 
                    delete: { 
                        remoteJid: chatId, 
                        fromMe: quotedContext.participant === sock.user.id, 
                        id: quotedContext.stanzaId, 
                        participant: quotedContext.participant 
                    } 
                });
                return;
            }

            /* ---------------- ADD MEMBER ---------------- */
            if (invokedCmd === 'add') {
                if (!args[0]) {
                    return await sock.sendMessage(chatId, { 
                        text: `┌─ム ${getTitle('add')}\n\n╭─〔 *ᴜꜱᴀɢᴇ* 〕─┈⊷\n│ ➕ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴀᴅᴅ <ɴᴜᴍʙᴇʀ>\n│ 📌 *ᴇxᴀᴍᴘʟᴇ:* ${prefix}ᴀᴅᴅ 94771234567\n╰─────────────┈⊷\n\n> ${config.BOT_FOOTER}`,
                        contextInfo: forwardContext()
                    }, { quoted: msg });
                }
                
                const number = args[0].replace(/\D/g, '');
                if (!number) throw new Error('ɪɴᴠᴀʟɪᴅ ᴘʜᴏɴᴇ ɴᴜᴍʙᴇʀ.');
                
                const res = await sock.groupParticipantsUpdate(chatId, [`${number}@s.whatsapp.net`], 'add');
                
                if (res[0].status === '200') {
                    return await sock.sendMessage(chatId, { 
                        text: `┌─ム ${getTitle('add')}\n\n✅ *ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ ᴀᴅᴅᴇᴅ* +${number}\n\n> ${config.BOT_FOOTER}`,
                        contextInfo: forwardContext()
                    }, { quoted: msg });
                } else {
                    throw new Error('ᴄᴏᴜʟᴅ ɴᴏᴛ ᴀᴅᴅ ᴜꜱᴇʀ. ᴛʜᴇʏ ᴍᴀʏ ʜᴀᴠᴇ ᴘʀɪᴠᴀᴄʏ ꜱᴇᴛᴛɪɴɢꜱ ᴇɴᴀʙʟᴇᴅ.');
                }
            }

            /* ---------------- KICK, PROMOTE, DEMOTE, WARN ---------------- */
            if (!target) {
                return await sock.sendMessage(chatId, { 
                    text: `❌ ᴘʟᴇᴀꜱᴇ ᴍᴇɴᴛɪᴏɴ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴜꜱᴇʀ ᴛᴏ *${invokedCmd}*.\n\n> ${config.BOT_FOOTER}`,
                    contextInfo: forwardContext()
                }, { quoted: msg });
            }

            const targetNumber = target.split('@')[0];

            if (invokedCmd === 'kick') {
                await sock.groupParticipantsUpdate(chatId, [target], 'remove');
                return await sock.sendMessage(chatId, { 
                    text: `┌─ム ${getTitle('kick')}\n\n👢 *ᴋɪᴄᴋᴇᴅ* @${targetNumber} ꜰʀᴏᴍ ᴛʜᴇ ɢʀᴏᴜᴘ.\n\n> ${config.BOT_FOOTER}`,
                    mentions: [target],
                    contextInfo: forwardContext()
                }, { quoted: msg });
            }

            if (invokedCmd === 'promote') {
                await sock.groupParticipantsUpdate(chatId, [target], 'promote');
                return await sock.sendMessage(chatId, { 
                    text: `┌─ム ${getTitle('promote')}\n\n👑 *ᴘʀᴏᴍᴏᴛᴇᴅ* @${targetNumber} ᴀꜱ ᴀɴ ᴀᴅᴍɪɴ.\n\n> ${config.BOT_FOOTER}`,
                    mentions: [target],
                    contextInfo: forwardContext()
                }, { quoted: msg });
            }

            if (invokedCmd === 'demote') {
                await sock.groupParticipantsUpdate(chatId, [target], 'demote');
                return await sock.sendMessage(chatId, { 
                    text: `┌─ム ${getTitle('demote')}\n\n📉 *ᴅᴇᴍᴏᴛᴇᴅ* @${targetNumber} ꜰʀᴏᴍ ᴀᴅᴍɪɴ.\n\n> ${config.BOT_FOOTER}`,
                    mentions: [target],
                    contextInfo: forwardContext()
                }, { quoted: msg });
            }

            if (invokedCmd === 'warn') {
                // Warn ekata reason ekak thiyenawa nam gannawa
                const reason = args.join(' ') || 'ɴᴏ ʀᴇᴀꜱᴏɴ ᴘʀᴏᴠɪᴅᴇᴅ';
                
                return await sock.sendMessage(chatId, { 
                    text: `┌─ム ${getTitle('warn')}\n\n⚠️ *ᴡᴀʀɴɪɴɢ!*\n\n👤 *ᴜꜱᴇʀ:* @${targetNumber}\n📝 *ʀᴇᴀꜱᴏɴ:* ${reason}\n\nᴘʟᴇᴀꜱᴇ ꜰᴏʟʟᴏᴡ ᴛʜᴇ ɢʀᴏᴜᴘ ʀᴜʟᴇꜱ.\n\n> ${config.BOT_FOOTER}`,
                    mentions: [target],
                    contextInfo: forwardContext()
                }, { quoted: msg });
            }

        } catch (err) {
            console.error('Admin Cmd Error:', err.message);
            await sock.sendMessage(chatId, { 
                text: `❌ ꜰᴀɪʟᴇᴅ ᴛᴏ ᴇxᴇᴄᴜᴛᴇ ᴄᴏᴍᴍᴀɴᴅ.\n\n${err.message}\n\n> ${config.BOT_FOOTER}`, 
                contextInfo: forwardContext() 
            }, { quoted: msg });
        }
    }
};