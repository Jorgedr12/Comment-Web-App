import { getComments, createComment, deleteComment } from '../controllers/controllers.js';
import express from 'express';
import { verifyToken } from '../middleware/auth.js';


const router = express.Router();

router.get('/comments', getComments);
router.post('/comments', createComment);
router.delete('/comments/:id', deleteComment);

export default router;