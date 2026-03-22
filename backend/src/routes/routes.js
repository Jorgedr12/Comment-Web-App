import { getComments, createComment, deleteComment, getUsers, createUser, removeUser, login } from '../controllers/controllers.js';
import express from 'express';
import { verifyToken } from '../middleware/auth.js';


const router = express.Router();

router.get('/comments', verifyToken, getComments);
router.post('/comments', verifyToken, createComment);
router.delete('/comments/:id', verifyToken, deleteComment);
router.get('/users', verifyToken, getUsers);
router.delete('/users/:id', verifyToken, removeUser);
router.post('/users', createUser);
router.post('/login', login);


export default router;