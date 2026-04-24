import { Router } from 'express';
import { getCategories } from '../controllers/category.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, getCategories);

export default router;
