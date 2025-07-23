import express, { Router } from "express";
import {
  getRevenue,
  getDeviceUsage,
  getWorldActivity,
  getSystemStats,
  getResourceMonitor,
} from '../controllers/admin.controller';

const router: Router = express.Router();

router.get('/dashboard/revenue', getRevenue);
router.get('/dashboard/device-usage', getDeviceUsage);
router.get('/dashboard/world-activity', getWorldActivity);
router.get('/dashboard/system-stats', getSystemStats);
router.get('/dashboard/resource-monitor', getResourceMonitor);

export default router;