import { Router , Request , Response} from 'express';
import{authMiddleware } from '../../Middlewares/auth.middleware.js';
import { mapTag_update_control } from '../../Controller/MapTag_control/write.control.js';

const router = Router();

router.patch('/iiot/patch/map_tag', authMiddleware , mapTag_update_control );

export default router;