import express from 'express';
import { isAuth } from '../../middlewares/is-auth';
import { createPost, getPosts } from '../../controller/post.controller';

const router = express.Router();

/**
 * Create a new post
 */
router.post("/", isAuth, createPost);

/**
 * Get all posts
 */
router.get("/", getPosts);

export default router;
