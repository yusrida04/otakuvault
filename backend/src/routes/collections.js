import { Router } from 'express';
import { getUserCollection, getUserStats, addToCollection, updateCollection, removeFromCollection } from '../controllers/collectionController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All collection routes require authentication
router.use(authenticate);

router.get('/', getUserCollection);
router.get('/stats', getUserStats);
router.post('/', addToCollection);
router.patch('/:id', updateCollection);
router.delete('/:id', removeFromCollection);

export default router;
