const config = require('../config');

const PREFIX = config.PREFIX || '.';

const HEADER = (title) => `
╭─「 *QUEEN ZARA* 」
│
│  \`${title}\`
│  ────────────────
│  *© 𝑺𝒊𝒓𝒊𝒎𝒂𝒕𝒉 👅*
╰─────────────────
`;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    name: 'group',
    alias: [
        'kick',
        'add',
        'promote',
        'demote',
        'tagall',
        'hidetag',
        'admins',
        'members',
        'groupinfo'
    ],
    desc: 'Queen Zara Group Management',
    category: 'group',

    async execute(sock, msg, args, text, ctx = {}) {

        const from = ctx.from || msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const isGroup = from.endsWith('@g.us');

        const command = (
            ctx.command ||
            (args || []).shift() ||
            'group'
        ).toLowerCase();

        const input = (args || []).join(' ').trim();

        const reply = async (message) => {
            return sock.sendMessage(
                from,
                { text: message },
                { quoted: msg }
            );
        };

        const error = (message) => {
            return reply(
                HEADER('GROUP MANAGEMENT') +
                `\n\n✘ ${message}`
            );
        };

        try {

            // GROUP CHECK
            if (!isGroup) {
                return error('This command works only in groups.');
            }

            // GROUP METADATA
            const metadata = await sock.groupMetadata(from);

            const participants = metadata.participants || [];

            const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

            const getNumber = (jid) =>
                jid.split('@')[0].split(':')[0];

            const normalizeJid = (jid) => {
                const number = getNumber(jid);
                return number + '@s.whatsapp.net';
            };

            const senderJid = normalizeJid(sender);
            const ownerNumber = String(
                config.OWNER_NUMBER || ''
            ).replace(/\D/g, '');

            const isOwner = ownerNumber &&
                getNumber(senderJid) === ownerNumber;

            const senderData = participants.find(
                p => normalizeJid(p.id) === senderJid
            );

            const botData = participants.find(
                p => normalizeJid(p.id) === normalizeJid(botJid)
            );

            const isAdmin = isOwner ||
                senderData?.admin === 'admin' ||
                senderData?.admin === 'superadmin';

            const botAdmin =
                botData?.admin === 'admin' ||
                botData?.admin === 'superadmin';

            const getTargets = () => {
                const context =
                    msg.message?.extendedTextMessage?.contextInfo ||
                    msg.message?.imageMessage?.contextInfo ||
                    msg.message?.videoMessage?.contextInfo ||
                    {};

                const mentioned = context.mentionedJid || [];

                const quoted = context.participant
                    ? [context.participant]
                    : [];

                return [...new Set(
                    [...mentioned, ...quoted].map(normalizeJid)
                )];
            };

            const getTarget = () => {
                const targets = getTargets();

                if (targets.length) return targets[0];

                if (input) {
                    const number = input.replace(/\D/g, '');

                    if (number.length >= 7 && number.length <= 15) {
                        return number + '@s.whatsapp.net';
                    }
                }

                return null;
            };

            const groupReply = async (title, message) => {
                return reply(
                    HEADER(title) + '\n' + message
                );
            };

            const adminCommands = [
                'kick',
                'add',
                'promote',
                'demote',
                'tagall',
                'hidetag'
            ];

            if (adminCommands.includes(command) && !isAdmin) {
                return error('Only group admins can use this command.');
            }

            const botCommands = [
                'kick',
                'add',
                'promote',
                'demote'
            ];

            if (botCommands.includes(command) && !botAdmin) {
                return error('Please make Queen Zara a group admin first.');
            }

            // KICK
            if (command === 'kick') {

                const target = getTarget();

                if (!target) {
                    return error(
                        `Usage: ${PREFIX}kick @user`
                    );
                }

                if (normalizeJid(target) === normalizeJid(botJid)) {
                    return error('I cannot remove myself.');
                }

                const targetData = participants.find(
                    p => normalizeJid(p.id) === normalizeJid(target)
                );

                if (!targetData) {
                    return error('User is not in this group.');
                }

                if (targetData.admin === 'superadmin') {
                    return error('Cannot remove the group creator.');
                }

                await sock.groupParticipantsUpdate(
                    from,
                    [target],
                    'remove'
                );

                return groupReply(
                    'MEMBER REMOVED',
                    `\n✔ Successfully removed @${getNumber(target)}\n`
                );
            }

            // ADD
            if (command === 'add') {

                if (!input) {
                    return error(
                        `Usage: ${PREFIX}add 947XXXXXXXX`
                    );
                }

                const number = input.replace(/\D/g, '');

                if (number.length < 7 || number.length > 15) {
                    return error('Please enter a valid phone number.');
                }

                const target = number + '@s.whatsapp.net';

                if (participants.some(
                    p => normalizeJid(p.id) === target
                )) {
                    return error('User is already in this group.');
                }

                const result = await sock.groupParticipantsUpdate(
                    from,
                    [target],
                    'add'
                );

                return groupReply(
                    'ADD MEMBER',
                    `\n✔ Add request sent to ${number}\n\n` +
                    `Result: ${JSON.stringify(result)}\n`
                );
            }

            // PROMOTE
            if (command === 'promote') {

                const target = getTarget();

                if (!target) {
                    return error(
                        `Usage: ${PREFIX}promote @user`
                    );
                }

                const targetData = participants.find(
                    p => normalizeJid(p.id) === normalizeJid(target)
                );

                if (!targetData) {
                    return error('User is not in this group.');
                }

                if (targetData.admin) {
                    return error('User is already an admin.');
                }

                await sock.groupParticipantsUpdate(
                    from,
                    [target],
                    'promote'
                );

                return groupReply(
                    'ADMIN PROMOTED',
                    `\n✔ @${getNumber(target)} is now an admin.\n`
                );
            }

            // DEMOTE
            if (command === 'demote') {

                const target = getTarget();

                if (!target) {
                    return error(
                        `Usage: ${PREFIX}demote @user`
                    );
                }

                const targetData = participants.find(
                    p => normalizeJid(p.id) === normalizeJid(target)
                );

                if (!targetData) {
                    return error('User is not in this group.');
                }

                if (!targetData.admin) {
                    return error('User is not an admin.');
                }

                if (targetData.admin === 'superadmin') {
                    return error('Cannot demote the group creator.');
                }

                await sock.groupParticipantsUpdate(
                    from,
                    [target],
                    'demote'
                );

                return groupReply(
                    'ADMIN DEMOTED',
                    `\n✔ @${getNumber(target)} is no longer an admin.\n`
                );
            }

            // TAG ALL
            if (command === 'tagall') {

                const members = participants.map(p => p.id);

                const message = input || 'Attention everyone!';

                const mentions = members.map(
                    p => `@${getNumber(p)}`
                );

                let output = '';

                output += HEADER('GROUP ANNOUNCEMENT');
                output += `\n\n*Message:* ${message}\n\n`;
                output += '*Members:*\n';
                output += mentions.join('\n');

                return sock.sendMessage(
                    from,
                    {
                        text: output,
                        mentions: members
                    },
                    { quoted: msg }
                );
            }

            // HIDE TAG
            if (command === 'hidetag') {

                const members = participants.map(p => p.id);

                const message = input || 'Attention everyone!';

                return sock.sendMessage(
                    from,
                    {
                        text:
                            HEADER('HIDDEN TAG') +
                            `\n\n${message}`,
                        mentions: members
                    },
                    { quoted: msg }
                );
            }

            // ADMINS
            if (command === 'admins') {

                const admins = participants.filter(
                    p => p.admin
                );

                let output = '';

                admins.forEach((admin, index) => {
                    output += `\n${index + 1}. @${getNumber(admin.id)}`;
                });

                return sock.sendMessage(
                    from,
                    {
                        text:
                            HEADER('GROUP ADMINS') +
                            `\n\n*Total Admins:* ${admins.length}\n` +
                            output,
                        mentions: admins.map(p => p.id)
                    },
                    { quoted: msg }
                );
            }

            // MEMBERS
            if (command === 'members') {

                const members = participants;

                let output = '';

                members.forEach((member, index) => {
                    output += `\n${index + 1}. @${getNumber(member.id)}`;
                });

                return sock.sendMessage(
                    from,
                    {
                        text:
                            HEADER('GROUP MEMBERS') +
                            `\n\n*Total Members:* ${members.length}\n` +
                            output,
                        mentions: members.map(p => p.id)
                    },
                    { quoted: msg }
                );
            }

            // GROUP INFO
            if (command === 'groupinfo') {

                const admins = participants.filter(
                    p => p.admin
                ).length;

                const info = `
*Group Name:* ${metadata.subject || 'Unknown'}

*Group ID:* ${from}

*Members:* ${participants.length}

*Admins:* ${admins}

*Created:* ${
                    metadata.creation
                        ? new Date(metadata.creation * 1000).toLocaleString()
                        : 'Unknown'
                }

*Description:*
${metadata.desc || 'No description'}
`;

                return groupReply(
                    'GROUP INFORMATION',
                    info
                );
            }

            return error('Unknown group command.');

        } catch (err) {

            console.error('[QUEEN ZARA GROUP ERROR]', err);

            return error(
                'Something went wrong. Please check bot permissions and try again.'
            );
        }
    }
};
