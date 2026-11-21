'use strict';

try { require('dotenv').config(); } catch (e) {}

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT) || 8000;

require('events').EventEmitter.defaultMaxListeners = 500;

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const code = require('./pair');
app.use('/code', code);

app.get('/pair', (req, res) => {
    const page = path.join(PUBLIC_DIR, 'index.html');
    if (!fs.existsSync(page)) {
        return res.status(404).send('Pairing page not found. Check public/index.html');
    }
    res.sendFile(page);
});

app.use(express.static(PUBLIC_DIR, { index: false }));

app.use((req, res) => {
    const page = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(page)) return res.sendFile(page);
    return res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
    console.error('HTTP error:', err && err.message ? err.message : err);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
    console.log(`
👑 ★ 𝑸𝒖𝒆𝒆𝒏 𝒁𝒂𝒓𝒂 ★

Developer: 𝑺𝒊𝒓𝒊𝒎𝒂𝒕𝒉 𝑫𝒆𝒗 </>

Server running on port ${PORT}`);
});

let shuttingDown = false;
const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received. Closing Queen Zara safely...`);

    const forceExit = setTimeout(() => process.exit(1), 10000);
    forceExit.unref();

    try {
        await code.shutdown();
    } catch (err) {
        console.error('Session flush error:', err);
    }

    server.close(() => {
        clearTimeout(forceExit);
        process.exit(0);
    });
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
});

module.exports = app;
