import { Router , Request , Response} from 'express';
import{ Auth_reqConnect } from '../../Middlewares/auth.reqConnect.js';
import { device_post_control, device_update_control } from '../../Controller/Device_control/write.control.js';
import { device_get_control } from '../../Controller/Device_control/read.control.js';
import { authMiddleware } from '../../Middlewares/auth.middleware.js';

const router = Router();

router.post('/iiot/post/device', authMiddleware , device_post_control );
router.post('/iiot/post/req_connect', Auth_reqConnect , (req:Request, res:Response) => { return res.status(200).json('ok'); });
router.get('/iiot/get/device',  authMiddleware , device_get_control);
router.patch('/iiot/patch/device', authMiddleware , device_update_control);

export default router;