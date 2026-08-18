import { Router } from 'express';
import { ingestionController } from '../controllers/ingestion.controller.js';

const router = Router();

router.get('/runs', ingestionController.getRuns);
router.get('/events', ingestionController.getEvents);
router.post('/run', ingestionController.triggerRun);

export default router;
