import { Router } from 'express';
import { getChapterNotes, createChapterNote, updateChapterNote, deleteChapterNote } from '../controllers/chapterController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/:mediaId', getChapterNotes);
router.post('/', createChapterNote);
router.patch('/:id', updateChapterNote);
router.delete('/:id', deleteChapterNote);

export default router;
