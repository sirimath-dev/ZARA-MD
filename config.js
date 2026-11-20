// config.js
module.exports = {
    FIREBASE_URL: 'https://queen-hiru-default-rtdb.asia-southeast1.firebasedatabase.app/',
    // FIREBASE_SECRET: '',   // thiyenawa nam .env / meka haraha danna
    BOT_NAME: 'ǫᴜᴇᴇɴ ʜɪʀᴜ </>',
    BOT_FOOTER: '© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ǫᴜᴇᴇɴ ʜɪʀᴜ </>',
    PREFIX: '.',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/KOLvDIS9Btl7VK5E2dc03H?s=cl&p=a&iam=2',
    RCD_IMAGE_PATH: 'https://i.ibb.co/20BY6CjQ/c2f47808-f67a-4e19-bcea-65c1cd2316bf.jpg', // bot logo
    OTP_EXPIRY: 300000,
    OWNER_NUMBER: '94720689634',
    OCR_API_KEY: '', // thiyenawa nam .env / meka haraha danna
    OMDB_API_KEY: 'c51d1824',

    // ---- Dashboard eken maru karanna puluwan settings (default values) ----
    AUTO_STATUS_SEEN: false,
    AUTO_STATUS_REACT: false,
    STATUS_EMOJIS: '💚,❤️,🔥,😍,👏,😎',
    AUTO_READ: false,
    ALWAYS_ONLINE: false,
    AUTO_TYPING: false,
    ANTI_DELETE: true,
    ANTI_EDIT: true,
    FORWARD_TAG: true,   // bot ge msgs channel ekak eken forward una wage pennanawa
    NEWSLETTER_JID: '120363430608120117@newsletter',
    ANTI_DEST: 'owner' // 'owner' = bot number eke own chat eka | 'chat' = delete/edit una chat eka
};