// .settings                -> show all settings
// .settings antidelete on  -> change one
// .mode private / .mode public
const BOOL = {
    antidelete: 'ANTI_DELETE',
    antiedit: 'ANTI_EDIT',
    antiviewonce: 'ANTI_VIEWONCE',
    antivv: 'ANTI_VIEWONCE',
    anticall: 'ANTI_CALL',
    vvreply: 'VV_EMOJI_REPLY',
    statusseen: 'AUTO_STATUS_SEEN',
    statusreact: 'AUTO_STATUS_REACT',
    autoread: 'AUTO_READ',
    online: 'ALWAYS_ONLINE',
    typing: 'AUTO_TYPING',
    recording: 'AUTO_RECORDING',
    like: 'AUTO_LIKE',
    away: 'AWAY_MODE'
};
const TEXT = {
    prefix: 'PREFIX',
    footer: 'BOT_FOOTER',
    logo: 'RCD_IMAGE_PATH',
    statusemojis: 'STATUS_EMOJIS',
    likeemojis: 'LIKE_EMOJIS',
    vvemojis: 'VV_EMOJIS',
    awaymsg: 'AWAY_MSG',
    dest: 'ANTI_DEST',
    mode: 'mode'
};
const ON = ['on', 'true', 'yes', 'enable', '1'];
const OFF = ['off', 'false', 'no', 'disable', '0'];
const ic = (v) => (v === true || v === 'true' ? '✅' : '❌');

module.exports = {
    name: 'settings',
    alias: ['setting', 'config', 'mode'],
    async execute(socket, msg, args, text, ctx) {
        const { from, config: cfg, prefix, command } = ctx;
        const reply = (t) => socket.sendMessage(from, { text: t }, { quoted: msg });

        // .mode public|private
        if (command === 'mode') {
            const v = String(args[0] || '').toLowerCase();
            if (!['public', 'private'].includes(v)) {
                return reply(`⚙️ Mode: *${String(cfg.mode || 'public').toUpperCase()}*\n\nUse *${prefix}mode public* or *${prefix}mode private*`);
            }
            await ctx.setConfig({ mode: v });
            return reply(`✅ Mode changed to *${v.toUpperCase()}*`);
        }

        // .settings  (list)
        if (!args.length) {
            let t = '⚙️ *SETTINGS*\n\n';
            t += `🌐 mode: *${String(cfg.mode || 'public')}*\n`;
            for (const [k, key] of Object.entries(BOOL)) {
                if (k === 'antivv') continue;
                t += `${ic(cfg[key])} ${k}\n`;
            }
            t += `\n🔤 prefix: *${cfg.PREFIX}*\n📝 footer: ${cfg.BOT_FOOTER}\n📍 dest: ${cfg.ANTI_DEST || 'owner'}\n`;
            t += `\n*Change:* ${prefix}settings <name> <on/off/value>\n`;
            t += `*Example:* ${prefix}settings antidelete on\n`;
            t += `*Example:* ${prefix}settings footer My bot\n`;
            t += `*Text names:* ${Object.keys(TEXT).join(', ')}`;
            return reply(t);
        }

        const name = String(args[0]).toLowerCase();
        const val = args.slice(1).join(' ').trim();

        if (BOOL[name]) {
            const v = val.toLowerCase();
            let b;
            if (ON.includes(v)) b = true;
            else if (OFF.includes(v)) b = false;
            else return reply(`Use: *${prefix}settings ${name} on* or *off*`);
            await ctx.setConfig({ [BOOL[name]]: b });
            return reply(`${ic(b)} *${name}* is now *${b ? 'ON' : 'OFF'}*`);
        }

        if (TEXT[name]) {
            if (!val) return reply(`Use: *${prefix}settings ${name} <value>*`);
            try {
                await ctx.setConfig({ [TEXT[name]]: val });
                return reply(`✅ *${name}* updated.`);
            } catch (e) {
                return reply(`❌ ${e.message}`);
            }
        }

        return reply(`❌ Unknown setting. Send *${prefix}settings* to see the list.`);
    }
};