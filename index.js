try { require('dotenv').config(); } catch (e) {}

const express = require('express');
const path = require('path');

const app = express();
const ROOT = process.cwd();
const PORT = process.env.PORT || 8000;

require('events').EventEmitter.defaultMaxListeners = 500;

// Heroku / Render / Koyeb wage proxy ekak passe inna nisa (rate limit walata ona)
app.set('trust proxy', 1);

// Body parsers routes walata ISSELLA
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const code = require('./pair');

app.use('/code', code);

app.get('/pair', (req, res) => {
    res.sendFile(path.join(ROOT, 'public', 'index.html'));
});

app.use(express.static(path.join(ROOT, 'public'), { index: false }));

app.use((req, res) => {
    res.sendFile(path.join(ROOT, 'public', 'index.html'));
});

const server = app.listen(PORT, () => {
    console.log(`
Don't Forget To Give Star ‼️

Forward By Anuhas Bandara

Server running on http://localhost:${PORT}`);
});

// Crash unata process eka restart karanne nathuwa log witarak karanawa
process.on('uncaughtException', (err) => console.error('Uncaught exception:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));

// Stop wenakota session data Firebase ekata flush karanawa
const shutdown = async (signal) => {
    console.log(`${signal} received, saving sessions...`);
    try { await code.shutdown(); } catch (e) { console.error(e); }
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 8000).unref();
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;