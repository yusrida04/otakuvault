import { Router } from 'express';
import { syncMAL, previewMAL } from '../controllers/malSyncController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Preview tidak butuh auth (bisa dicek tanpa login)
router.get('/mal/preview/:username', previewMAL);

// Sync butuh auth
router.post('/mal', authenticate, syncMAL);

export default router;