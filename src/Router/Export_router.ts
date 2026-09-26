import { Router } from 'express'; 
import path_login_sigin from './path/path_login_sigin.js';
import path_MQTT from './path/path_MQTT.js';


const router = Router();
router.use(path_login_sigin);
// router.use(path_MQTT);

export default router;