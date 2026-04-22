import { Router } from 'express';
import { getAllMedia, getMediaById, createMedia, updateMedia, deleteMedia } from '../controllers/mediaController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllMedia);
router.get('/:id', getMediaById);
router.post('/', authenticate, createMedia);
router.patch('/:id', authenticate, updateMedia);
router.delete('/:id', authenticate, deleteMedia);

export default router;
