import { Router } from 'express';
import { jobsController } from '../controllers/jobs.controller.js';

const router = Router();

router.get('/', jobsController.getJobs);
router.get('/:id', jobsController.getJobById);

export default router;
