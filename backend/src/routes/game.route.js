import express from 'express';
import {
  createGame,
  getGames,
  getGame,
  joinGame,
  makeMove,
  getHint,
  deleteGame,
  getMyGames
} from '../controllers/game.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getGames);
router.get('/:id', getGame);

// Protected routes
router.post('/', protect, createGame);
router.put('/:id/join', protect, joinGame);
router.put('/:id/move', protect, makeMove);
router.get('/:id/hint', protect, getHint);
router.delete('/:id', protect, deleteGame);
router.get('/my/games', protect, getMyGames);

export default router;