import express, { Router } from "express";
import {
  getRevenue,
  getDeviceUsage,
  getWorldActivity,
  getSystemStats,
  getResourceMonitor,
  getAllProducts,
  getAllEvents,
  getAllAdmins,
  addNewAdmin,
  getAllCustomizations,
  getAllUsers,
  getAllSellers,
} from '../controllers/admin.controller';
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isAdmin } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.get('/dashboard/revenue', getRevenue,isAuthenticated,isAdmin);
router.get('/dashboard/device-usage', getDeviceUsage,isAuthenticated,isAdmin);
router.get('/dashboard/world-activity', getWorldActivity),isAuthenticated,isAdmin;
router.get('/dashboard/system-stats', getSystemStats,isAuthenticated,isAdmin);
router.get('/dashboard/resource-monitor', getResourceMonitor,isAuthenticated,isAdmin);
router.get('/get-all-products',isAuthenticated,isAdmin,getAllProducts)
router.get('/get-all-events',isAuthenticated,isAdmin,getAllEvents)
router.get('/get-all-admins',isAuthenticated,isAdmin,getAllAdmins)
router.get('/get-new-admin',isAuthenticated,isAdmin,addNewAdmin)
router.get("/get-all-users",isAdmin,isAuthenticated,getAllUsers)
router.get("/get-all-sellers",isAdmin,isAuthenticated,getAllSellers)
router.get('/get-all',getAllCustomizations)


export default router;