import { Router , Request , Response} from 'express';
import{authMiddleware } from '../../Middlewares/auth.middleware.js';
import { mapTag_update_control } from '../../Controller/MapTag_control/write.control.js';
import { Tag_get_control } from '../../Controller/MapTag_control/read.control.js';

const router = Router();

router.patch('/iiot/patch/tag', authMiddleware , mapTag_update_control );
router.get('/iiot/get/tag',  authMiddleware , Tag_get_control );

export default router;