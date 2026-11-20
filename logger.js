const util = require('util');
const moment = require('moment-timezone');

const MAX = 600;
const buf = [];
let seq = 0;

const C = { r: '\x1b[0m', gray: '\x1b[90m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m' };
const LEVELS = {
    log: ['INFO', C.cyan],
    info: ['INFO', C.cyan],
    warn: ['WARN', C.yellow],
    error: ['ERROR', C.red]
};
const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
const orig = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console)
};

for (const k of Object.keys(LEVELS)) {
    console[k] = (...args) => {
        let [name, color] = LEVELS[k];
        const text = util.format(...args);
        if (k !== 'error' && k !== 'warn') {
            if (/^\s*(✅|🔁|📢|🧹)/.test(text)) { name = 'OK'; color = C.green; }
            else if (/^\s*(❌|⚠️)/.test(text)) { name = 'WARN'; color = C.yellow; }
        }
        const ts = moment().tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss');
        orig[k === 'error' ? 'error' : 'log'](`${C.gray}${ts}${C.r} ${color}${name.padEnd(5)}${C.r} ${text}`);
        buf.push({ id: ++seq, t: Date.now(), level: name, msg: strip(text).slice(0, 2000) });
        if (buf.length > MAX) buf.shift();
    };
}

module.exports = {
    tail: (since = 0, limit = 300) => buf.filter(l => l.id > since).slice(-limit),
    lastId: () => seq,
    clear: () => { buf.length = 0; }
};