import { Request, Response, NextFunction } from 'express';
import HelperService from '../service/helper_func.js';

export const authMiddleware = (req:Request, res:Response, next:NextFunction) => {;
    console.log('----- API action: authMiddleware -----');
    const authHeader = req.headers.authorization; //ดึงจาก http header
    // รูปแบบถูกต้อง (ขึ้นต้นด้วย Bearer) ไหม
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Unauthorized: ไม่พบ Token');
        return res.status(401).json({ message: 'Unauthorized: ไม่พบ Token' });
    }
    //มาแบบนี้ Bearer Token เลยตัดช่องว่างตรงกลางออก จะได้เป้นอาเรย์ Bearer[0] Toekn[1]
    const token = authHeader.split(' ')[1];  //เลือก index 1 มาใช้
    console.log('Token :', token);

    if (!token) {
        console.log('You do not have permission to access this page');
        return res.status(401).json({ message: 'You do not have permission to access this page' });
    }

    try {
        const decoded = HelperService.verifyToken(token);
        (req as any).payload = decoded; //.ใส่ user id ที่เกะจาก token ไว้ที่ key payload (เป็น key ตั้งใหม่)
        console.log(decoded);
        if(!decoded) {
            console.log('unauthorized token');
            return res.status(401).json({ message: 'unauthorized 401' });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'กรุณาใช้ Token เข้าสู่ระบบ' });
    }
};