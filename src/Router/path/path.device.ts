import { Router , Request , Response} from 'express';
import{ Auth_reqConnect } from '../../Middlewares/auth.reqConnect.js';
import { device_post_control } from '../../Controller/Device_control/Write_control.js';

const router = Router();

router.post('/iiot/post/device', Auth_reqConnect , device_post_control );
// router.get('/iiot/get/device',  authMiddleware , MGet_control );
// router.patch('/iiot/patch/device', authMiddleware , Mqtt_updata_control );

export default router;