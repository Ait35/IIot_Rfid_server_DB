import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ให้เซฟไปที่โฟลเดอร์ public/uploads 
    // cd ย่อมาจาก call back แม่งทำมาค้ลาบกับ cd ที่เข้าถึง folder อีก
    cb(null, path.join(__dirname, '../../public/uploadsImg'));
  },
  filename: (req, file, cb) => {
    // ตั้งชื่อไฟล์ให้ไม่ซ้ำกัน เช่น cam_DOOR1_1696312345.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `cam_${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({ storage });