import { Router } from 'express';
import { getAllMedia, getMediaById, createMedia, updateMedia, deleteMedia } from '../controllers/mediaController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js'; // ← tambah optionalAuth

const router = Router();

// GET semua media — pakai optionalAuth, bukan authenticate
// Logic: kalau tidak login → kembalikan max 6 item sebagai "preview"
router.get('/', optionalAuth, getAllMedia);
router.get('/:id', optionalAuth, getMediaById);
router.post('/', authenticate, createMedia);
router.patch('/:id', authenticate, updateMedia);
router.delete('/:id', authenticate, deleteMedia);

export default router;