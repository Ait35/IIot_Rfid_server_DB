import { Router } from 'express'; 
import path_login_sigin from './path_login_sigin.js';


const router = Router();
router.use(path_login_sigin);

export default router;