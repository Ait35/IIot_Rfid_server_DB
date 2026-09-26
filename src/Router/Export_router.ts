import { Router } from 'express'; 
import path_login_sigin from './path/path_login_sigin.js';
import path_MQTT from './path/path_MQTT.js';
import Automated_Test from './path/Automated_Test.js';


const router = Router();
router.use(path_login_sigin);
router.use(path_MQTT);

//admin test ค่อยลบ
router.use(Automated_Test);

export default router;