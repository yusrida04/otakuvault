import { Router } from 'express';
import { getCharacters, createCharacter, deleteCharacter, chatWithCharacter } from '../controllers/characterController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/:mediaId',        optionalAuth, getCharacters);    // GET semua karakter (bisa tanpa login)
router.post('/',               authenticate, createCharacter);  // Buat karakter (harus login)
router.delete('/:id',          authenticate, deleteCharacter);  // Hapus karakter (harus login)
router.post('/:characterId/chat', authenticate, chatWithCharacter); // Chat (harus login)

export default router;