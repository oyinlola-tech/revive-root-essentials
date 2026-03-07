const multer = require('multer');
const fs = require('fs');
const path = require('path');
const AppError = require('../utils/AppError');

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = ALLOWED_MIME_TO_EXT[file.mimetype];
    if (!ext) {
      return cb(new AppError('Unsupported image type. Allowed: jpeg, png, webp, gif', 400));
    }
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (Object.prototype.hasOwnProperty.call(ALLOWED_MIME_TO_EXT, file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Unsupported image type. Allowed: jpeg, png, webp, gif', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

module.exports = upload;
