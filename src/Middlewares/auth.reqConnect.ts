import { Request, Response, NextFunction } from 'express';
import HelperService from '../service/helper_func.js';

export const reqConnectController = async (req: Request, res: Response, next:NextFunction) => {
    console.log('----- API action: authMiddleware -----');
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: ไม่พบ Token' });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token :', token);

    if (!token) {
        return res.status(401).json({ message: 'กรุณาใช้ Token เข้าสู่ระบบ' });
    }
    try {
        const decoded = HelperService.verifyToken(token);
        console.log(decoded);
        if(!decoded) {
            return res.status(401).json({ message: 'unauthorized 401' });
        }

        (req as any).payload = decoded;
        next();
    } catch (error) {
            res.status(401).json({ message: 'กรุณาใช้ Token เข้าสู่ระบบ' });
        }
};
// return res.json({
//         mqtt_server: "192.168.1.100", // หรือ Domain name ของคุณ
//         mqtt_port: 1883,
//         mqtt_user: device.mqtt_user,
//         mqtt_pass: device.mqtt_pass,
//         topic_pub: device.topic
//     });