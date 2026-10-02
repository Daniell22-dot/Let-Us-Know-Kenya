const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../uploads');

// Multer will throw ENOENT on the first upload if the directory is missing.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Extension -> trusted MIME type. Both sides are checked and the extension
// lookup is exact, so `evil.pdf.html` cannot slip through by containing a
// permitted substring the way the previous regex `/jpeg|jpg|png|gif|mp3|wav|ogg|pdf/`
// allowed.
const ALLOWED_TYPES = {
    '.jpg': ['image/jpeg'],
    '.jpeg': ['image/jpeg'],
    '.png': ['image/png'],
    '.gif': ['image/gif'],
    '.webp': ['image/webp'],
    '.mp3': ['audio/mpeg'],
    '.wav': ['audio/wav', 'audio/x-wav', 'audio/wave'],
    '.ogg': ['audio/ogg'],
    '.m4a': ['audio/mp4'],
    '.pdf': ['application/pdf']
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        // Generate the name ourselves instead of trusting the client filename.
        // `Date.now() + extname(originalname)` was both collision-prone at
        // millisecond resolution and allowed an attacker-chosen extension.
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${crypto.randomUUID()}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedMimes = ALLOWED_TYPES[ext];

        if (!allowedMimes) {
            return cb(new Error("Unsupported file type. Allowed: images, audio, and PDF."));
        }

        // file.mimetype comes from the client's multipart header, so it is
        // attacker-controlled. Treat a mismatch as a rejection rather than as
        // sufficient proof on its own.
        if (!allowedMimes.includes(file.mimetype)) {
            return cb(new Error("File extension and content type do not match."));
        }

        return cb(null, true);
    }
});

module.exports = upload;
