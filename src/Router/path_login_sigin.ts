import { Router , Request , Response} from 'express';
import { Sigin_control , Login_control }from '../Controller/user_control.js';

const router = Router();

router.post('/iiot/login', Login_control );
router.post('/iiot/sigin', Sigin_control );
router.get('/', (_req:Request, res:Response) => { //ต้องใส่ req เข้าไปเป็นตัวแรกเสมอ ถึงไม่ได้ใช้ก็ตาม
  res.status(404).send('404 Not Found');
});

export default router;
//ใน TypeScript นิยมใช้ _req เพื่อบอกว่าเราตั้งใจละเว้นไม่ใช้งานตัวแปรนี้