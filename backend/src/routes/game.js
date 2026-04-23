import { Router } from 'express';
import {
  getJournal, createJournalEntry, updateJournalEntry, deleteJournalEntry,
  getGameCollection, addGameItem, updateGameItem, deleteGameItem,
} from '../controllers/gameController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// Journal
router.get('/journal/:mediaId',    getJournal);
router.post('/journal',            createJournalEntry);
router.patch('/journal/:id',       updateJournalEntry);
router.delete('/journal/:id',      deleteJournalEntry);

// Collection
router.get('/collection/:mediaId', getGameCollection);
router.post('/collection',         addGameItem);
router.patch('/collection/:id',    updateGameItem);
router.delete('/collection/:id',   deleteGameItem);

export default router;