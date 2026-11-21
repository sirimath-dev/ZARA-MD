const os = require('os');
const moment = require('moment-timezone');
const config = require('../config');

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return [
        days ? `${days}d` : null,
        hours ? `${hours}h` : null,
        minutes ? `${minutes}m` : null,
        `${secs}s`
    ].filter(Boolean).join(' ');
}

function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 MB';
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

module.exports = {
    name: 'alive',
    alias: ['online', 'status'],
    description: 'Check bot status and uptime',
    category: 'main',

    async execute(socket, msg, args, text, ctx) {
        const from = ctx?.from || msg?.key?.remoteJid;
        if (!from) return;

        const started = Date.now();
        const botName = ctx?.config?.BOT_NAME || config.BOT_NAME || 'QUEEN ZARA';
        const prefix = ctx?.prefix || config.PREFIX || '.';
        const now = moment().tz('Asia/Colombo').format('DD MMM YYYY | hh:mm:ss A');
        const uptime = formatUptime(process.uptime());
        const memory = formatBytes(process.memoryUsage().rss);
        const platform = `${os.type()} ${os.release()}`;
        const nodeVersion = process.version;
        const botNumber = String(socket?.user?.id || '').split(':')[0].split('@')[0] || 'Connected';
        const ping = `${Date.now() - started} ms`;

        const caption =
`╭━━〔 ✦ ${botName} ✦ 〕━━╮
┃
┃  ✨ *SYSTEM STATUS : ONLINE*
┃  🟢 *Status:* Fully Active
┃  ⚡ *Response:* ${ping}
┃  ⏱️ *Uptime:* ${uptime}
┃  📱 *Bot:* ${botNumber}
┃  🧩 *Node.js:* ${nodeVersion}
┃  💾 *RAM Usage:* ${memory}
┃  🖥️ *Platform:* ${platform}
┃  🕒 *Sri Lanka:* ${now}
┃
┃  💬 *Prefix:* ${prefix}
┃  👨‍💻 *Developer:* SIRIMATH DEV
┃  🔗 *WhatsApp Automation System*
┃
╰━━━━━━━━━━━━━━━━━━━━╯

_Thanks for using ${botName}_
${ctx?.config?.BOT_FOOTER || config.BOT_FOOTER || '© SIRIMATH DEV'}`;

        const image = ctx?.config?.RCD_IMAGE_PATH || config.RCD_IMAGE_PATH;
        try {
            if (image) {
                await socket.sendMessage(from, {
                    image: { url: image },
                    caption
                }, { quoted: msg });
            } else {
                await socket.sendMessage(from, { text: caption }, { quoted: msg });
            }
        } catch (error) {
            await socket.sendMessage(from, { text: caption }, { quoted: msg }).catch(() => {});
        }
    }
};
