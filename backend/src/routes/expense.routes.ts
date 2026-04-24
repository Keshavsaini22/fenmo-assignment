import { Router } from 'express';
import { createExpense, getExpenses } from '../controllers/expense.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const createExpenseSchema = z.object({
    body: z.object({
        amount: z.number().positive(),
        description: z.string().min(1),
        date: z.string().datetime(),
        categoryId: z.string().uuid(),
    })
});

router.post('/', authenticateJWT, validateRequest(createExpenseSchema), createExpense);
router.get('/', authenticateJWT, getExpenses);

export default router;
