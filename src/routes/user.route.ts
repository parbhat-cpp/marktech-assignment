import express from 'express';

import { loginUser, signupUser } from '../controller/user.controller';

const router = express.Router();

/**
 * Create user (Sign up user)
 */
router.post("/signup", signupUser);

/**
 * Login user by email
 */
router.post("/login", loginUser);

export default router;
