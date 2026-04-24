import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
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

        // Check if expense with this idempotency key already exists for the user
        const existingExpense = await prisma.expense.findFirst({
            where: { idempotencyKey, userId }
        });

        if (existingExpense) {
            // Idempotency: Return existing expense gracefully
            return res.status(200).json({
                message: 'Expense already recorded (Idempotent replay)',
                expense: existingExpense
            });
        }

        // Create a new expense
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
        const { category, sortOn, sortDir } = req.query;

        const where: any = { userId };

        if (category) {
            where.categoryId = String(category);
        }

        const orderBy: any = {};
        if (sortOn) {
            orderBy[String(sortOn)] = sortDir === 'asc' ? 'asc' : 'desc';
        } else {
            orderBy.updatedAt = 'desc';
        }

        const expenses = await prisma.expense.findMany({
            where,
            orderBy,
            include: {
                category: true
            }
        });

        res.status(200).json(expenses);
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
