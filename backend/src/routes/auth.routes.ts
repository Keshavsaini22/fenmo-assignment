import { Router } from 'express';
import { z } from 'zod';
import { registerUser, loginUser } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';

const router = Router();

const registerSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
    })
});

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);

export default router;
