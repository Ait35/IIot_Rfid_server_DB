import { Router , Request , Response} from 'express';
import{authMiddleware } from '../../Middlewares/auth.middleware.js';
import { group_post_control , Group_update_control } from '../../Controller/Group_control/write.control.js';
import { Group_get_control } from '../../Controller/Group_control/read.control.js';


const router = Router();

router.post('/iiot/post/group', authMiddleware , group_post_control ); 
router.get('/iiot/get/group',  authMiddleware , Group_get_control );
router.patch('/iiot/patch/group', authMiddleware , Group_update_control );

export default router;