import { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const createExpense = async (req: AuthRequest, res: Response) => {
    try {
        const { amount, description, date, categoryId } = req.body;
        const idempotencyKey = req.headers['idempotency-key'] as string;
        const userId = req.user.id;

        if (!idempotencyKey) {
            return res.status(400).json({ error: 'Idempotency-Key header is required' });
        }

        const existingExpense = await prisma.expense.findFirst({
            where: { idempotencyKey, userId }
        });

        if (existingExpense) {
            return res.status(200).json({
                message: 'Expense already recorded (Idempotent replay)',
                expense: existingExpense
            });
        }

        const newExpense = await prisma.expense.create({
            data: {
                amount,
                description,
                date: new Date(date),
                categoryId,
                userId,
                idempotencyKey,
            },
            include: {
                category: true,
            }
        });

        res.status(201).json({
            message: 'Expense recorded successfully',
            expense: newExpense
        });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getExpenses = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { category, sortOn, sortDir, page, limit } = req.query;

        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const skip = (pageNum - 1) * limitNum;

        const where: Prisma.ExpenseWhereInput = { userId };

        if (category) {
            where.categoryId = String(category);
        }

        const orderBy: Prisma.ExpenseOrderByWithRelationInput = {};
        if (sortOn) {
            orderBy[String(sortOn) as keyof Prisma.ExpenseOrderByWithRelationInput] = sortDir === 'asc' ? 'asc' : 'desc';
        } else {
            orderBy.createdAt = 'desc';
        }

        const expenses = await prisma.expense.findMany({
            where,
            orderBy,
            skip,
            take: limitNum,
            include: {
                category: true
            }
        });

        const total = await prisma.expense.count({ where });
        const hasMore = skip + expenses.length < total;

        res.status(200).json({ expenses, hasMore, total });
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
