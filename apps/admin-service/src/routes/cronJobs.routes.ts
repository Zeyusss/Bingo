import { Router } from 'express';
import { 
  getAllCronJobs, 
  getCronJobDetails, 
  getCronJobCategories,
  getCronJobsStats 
} from '../controllers/cronJobs.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';

const router = Router();

// Get all cron jobs with pagination, search, and filtering
router.get('/all', isAuthenticated, getAllCronJobs);

// Get cron jobs statistics
router.get('/stats', isAuthenticated, getCronJobsStats);

// Get available categories for filtering
router.get('/categories', isAuthenticated, getCronJobCategories);

// Get detailed information about a specific cron job
router.get('/details/:jobId', isAuthenticated, getCronJobDetails);

export default router;
