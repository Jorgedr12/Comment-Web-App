import { getComments, createComment, deleteComment, getUsers, createUser, removeUser, login } from '../controllers/controllers.js';
import express from 'express';
import { verifyToken } from '../middleware/auth.js';


const router = express.Router();

router.get('/comments', getComments);
router.post('/comments', createComment);
router.delete('/comments/:id', deleteComment);
router.get('/users', getUsers);
router.delete('/users/:id', removeUser);
router.post('/users', createUser);
router.post('/login', login);


export default router;