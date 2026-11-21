const fs = require('fs');
const { tmpdir } = require('os');
const path = require('path');
const Crypto = require('crypto');
const config = require('../config');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

/* Lazy-load sharp with caching */
let sharpLib = undefined;
function getSharp() {
    if (sharpLib === undefined) {
        try {
            sharpLib = require('sharp');
        } catch (e) {
            console.warn('ToImg: sharp not installed, will use ffmpeg fallback');
            sharpLib = null;
        }
    }
    return sharpLib;
}

/* Small caps helper */
const SC = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
    n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};
const sc = (str) => String(str).toLowerCase().replace(/[a-z]/g, (ch) => SC[ch]);
const getTitle = (cmd, cfg = config) => `${sc(cfg.BOT_NAME || config.BOT_NAME)} </> ${sc(cmd)}`;

function forwardContext(cfg = config) {
    const contextInfo = { forwardingScore: 999, isForwarded: true };
    const channel = cfg.NEWSLETTER_JID || config.NEWSLETTER_JID;
    if (channel) {
        contextInfo.forwardedNewsletterMessageInfo = {
            newsletterJid: channel,
            newsletterName: cfg.BOT_NAME || config.BOT_NAME,
            serverMessageId: 1
        };
    }
    return contextInfo;
}

function tempFile(ext) {
    return path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}${ext}`);
}

/* Unwrap ephemeral / viewOnce wrappers */
function unwrap(message) {
    let m = message;
    while (m) {
        if (m.ephemeralMessage) m = m.ephemeralMessage.message;
        else if (m.viewOnceMessage) m = m.viewOnceMessage.message;
        else if (m.viewOnceMessageV2) m = m.viewOnceMessageV2.message;
        else if (m.documentWithCaptionMessage) m = m.documentWithCaptionMessage.message;
        else break;
    }
    return m;
}

/* FIX: iterate ALL keys, not just first (order isn't guaranteed) */
function getContextInfo(msg) {
    if (!msg || !msg.message) return null;
    const m = unwrap(msg.message) || {};
    for (const key of Object.keys(m)) {
        const val = m[key];
        if (val && typeof val === 'object' && val.contextInfo) return val.contextInfo;
    }
    return null;
}

async function downloadSticker(stickerMessage) {
    const stream = await downloadContentFromMessage(stickerMessage, 'sticker');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
}

/* FIX: force animated:false + failOn:none for animated/broken webp */
async function viaSharp(buffer) {
    const sharp = getSharp();
    if (!sharp) throw new Error('sharp not installed');
    return await sharp(buffer, { animated: false, failOn: 'none' }).png().toBuffer();
}

function viaFfmpeg(buffer) {
    let ffmpeg;
    try {
        ffmpeg = require('fluent-ffmpeg');
    } catch (e) {
        return Promise.reject(new Error('fluent-ffmpeg not installed'));
    }
    const input = tempFile('.webp');
    const output = tempFile('.png');
    const clean = () => {
        try { if (fs.existsSync(input)) fs.unlinkSync(input); } catch (e) {}
        try { if (fs.existsSync(output)) fs.unlinkSync(output); } catch (e) {}
    };
    return new Promise((resolve, reject) => {
        try {
            fs.writeFileSync(input, buffer);
            ffmpeg(input)
                .outputOptions(['-vframes 1'])
                .toFormat('png')
                .on('end', () => {
                    try { resolve(fs.readFileSync(output)); } catch (e) { reject(e); } finally { clean(); }
                })
                .on('error', (e) => { clean(); reject(new Error(`ffmpeg: ${e.message}`)); })
                .save(output);
        } catch (e) { clean(); reject(e); }
    });
}

/* Collect errors from both methods so user sees the real cause */
async function stickerToImage(buffer) {
    const errors = [];
    try {
        return await viaSharp(buffer);
    } catch (e) {
        errors.push(`sharp: ${e.message}`);
    }
    try {
        return await viaFfmpeg(buffer);
    } catch (e) {
        errors.push(`ffmpeg: ${e.message}`);
    }
    throw new Error(errors.join(' | '));
}

module.exports = {
    name: 'toimg',
    description: 'Sticker to image',
    category: 'tools',
    alias: ['toimage', 'sticker2img', 'sti'],

    async execute(sock, msg, args, text, ctx = {}) {
        const chatId = msg.key.remoteJid;
        const cfg = ctx.config || config;
        const prefix = ctx.prefix || cfg.PREFIX || config.PREFIX || '.';
        const footer = cfg.BOT_FOOTER || config.BOT_FOOTER || '';

        try { await sock.sendMessage(chatId, { react: { text: '🖼️', key: msg.key } }); } catch (e) {}

        const quotedContext = getContextInfo(msg);
        const quotedMessage = unwrap(quotedContext?.quotedMessage);
        const stickerMessage = quotedMessage?.stickerMessage;

        if (!stickerMessage) {
            return sock.sendMessage(chatId, {
                text: `┌─ム ${getTitle('toimg', cfg)}\n\n╭─〔 *ᴜꜱᴀɢᴇ* 〕─┈⊷\n│ 🖼️ *ʀᴇᴘʟʏ* ᴛᴏ ᴀ ꜱᴛɪᴄᴋᴇʀ\n│ 🔗 *ᴏʀ ᴛʏᴘᴇ:* ${prefix}ᴛᴏɪᴍɢ\n╰─────────────┈⊷\n\n> ${footer}`,
                contextInfo: forwardContext(cfg)
            }, { quoted: msg });
        }

        await sock.sendMessage(chatId, {
            text: `⏳ ᴄᴏɴᴠᴇʀᴛɪɴɢ ꜱᴛɪᴄᴋᴇʀ ᴛᴏ ɪᴍᴀɢᴇ...\n\n> ${footer}`,
            contextInfo: forwardContext(cfg)
        }, { quoted: msg });

        try {
            const stickerBuffer = await downloadSticker(stickerMessage);
            if (!stickerBuffer || stickerBuffer.length === 0) throw new Error('Failed to download sticker (empty buffer)');
            console.log(`ToImg: downloaded ${stickerBuffer.length} bytes`);

            const imageBuffer = await stickerToImage(stickerBuffer);
            if (!imageBuffer || imageBuffer.length === 0) throw new Error('Failed to convert (empty output)');
            console.log(`ToImg: converted to ${imageBuffer.length} bytes PNG`);

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: `┌─ム ${getTitle('toimg', cfg)}\n\n✅ *ᴄᴏɴᴠᴇʀᴛᴇᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ*\n\n> ${footer}`,
                contextInfo: forwardContext(cfg)
            }, { quoted: msg });

            await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

        } catch (err) {
            console.error('ToImg Error:', err);
            const errMsg = (err && err.message) ? err.message : String(err);
            await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
            await sock.sendMessage(chatId, {
                text: `❌ ꜰᴀɪʟᴇᴅ ᴛᴏ ᴄᴏɴᴠᴇʀᴛ ꜱᴛɪᴄᴋᴇʀ.\n\n⚠️ *ᴇʀʀᴏʀ:* ${errMsg.slice(0, 250)}\n\n💡 *ꜰɪx:*\n• npm install sharp\n• Or: npm install fluent-ffmpeg && apt install ffmpeg\n\n> ${footer}`,
                contextInfo: forwardContext(cfg)
            }, { quoted: msg });
        }
    }
};