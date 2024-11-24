import express from 'express';
import { isAuth } from '../middlewares/is-auth';
import { postComment } from '../controller/comment.controller';

const router = express.Router();

/**
 * Comment on a post
 */
router.post("/", isAuth, postComment);

export default router;
