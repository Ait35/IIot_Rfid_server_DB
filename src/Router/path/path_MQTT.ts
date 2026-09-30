import { Router , Request , Response} from 'express';
import{authMiddleware } from '../../Middlewares/auth.middleware.js';
import { MPost_control ,Mqtt_updata_control } from '../../Controller/Mqtt_control/write.control.js';
import { MGet_control } from '../../Controller/Mqtt_control/read.control.js';

const router = Router();

router.post('/iiot/post/mqtt', authMiddleware , MPost_control );
router.get('/iiot/get/mqtt',  authMiddleware , MGet_control );
router.patch('/iiot/patch/mqtt', authMiddleware , Mqtt_updata_control );

export default router;