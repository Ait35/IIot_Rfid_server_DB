import { Router } from 'express';
import { getDashboardSummary } from '../../Controller/DashboardController/dashboard.controller.js';
import { authMiddleware } from '../../Middlewares/auth.middleware.js';

const router = Router();

// /iiot/get/dashboard - Following the existing naming convention
router.get('/iiot/get/dashboard', authMiddleware, getDashboardSummary);

export default router;
