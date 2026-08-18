import { Router } from 'express';
import { sourcesController } from '../controllers/sources.controller.js';

const router = Router();

router.get('/', sourcesController.getSources);
router.get('/:source/health', sourcesController.getHealth);

export default router;
