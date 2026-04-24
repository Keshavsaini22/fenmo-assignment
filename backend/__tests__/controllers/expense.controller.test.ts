import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { createExpense, getExpenses } from '../../src/controllers/expense.controller';
import { ExpenseMother } from '../mother/expense.mother';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Mock the Prisma module
jest.mock('@prisma/client', () => {
    const mockPrisma = {
        expense: {
            create: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
        }
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma)
    };
});

describe('Expense Controller', () => {
    let mockReq: Partial<Request & { user?: any }>;
    let mockRes: Partial<Response>;
    let prisma: any;

    beforeEach(() => {
        prisma = new PrismaClient();
        jest.clearAllMocks();

        mockRes = {
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn() as any,
        };
    });

    describe('createExpense', () => {
        it('should successfully create a new expense natively avoiding duplicates (Idempotency)', async () => {
            // ============================================
            // ARRANGE
            // ============================================
            const payload = ExpenseMother.createValidPayload();
            const fakeIdempotencyKey = 'some-uuid-key';
            const fakeUserId = 'user-123';
            const mockDbExpense = ExpenseMother.createExpenseModel({ ...payload, userId: fakeUserId, idempotencyKey: fakeIdempotencyKey });

            mockReq = {
                body: payload,
                headers: { 'idempotency-key': fakeIdempotencyKey },
                user: { id: fakeUserId }
            };

            // Prisma mock behavior
            prisma.expense.findFirst.mockResolvedValue(null);
            prisma.expense.create.mockResolvedValue(mockDbExpense);

            // ============================================
            // ACT
            // ============================================
            await createExpense(mockReq as Request, mockRes as Response);

            // ============================================
            // ASSERT
            // ============================================
            expect(prisma.expense.findFirst).toHaveBeenCalledWith({
                where: { idempotencyKey: fakeIdempotencyKey, userId: fakeUserId }
            });
            expect(prisma.expense.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    amount: payload.amount,
                    description: payload.description,
                    categoryId: payload.categoryId,
                })
            }));

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Expense recorded successfully',
                expense: mockDbExpense
            });
        });

        it('should return 400 if the Idempotency-Key header is missing', async () => {
            // ARRANGE
            const payload = ExpenseMother.createValidPayload();
            mockReq = {
                body: payload,
                headers: {}, // Missing key
                user: { id: 'user-123' }
            };

            // ACT
            await createExpense(mockReq as Request, mockRes as Response);

            // ASSERT
            expect(prisma.expense.create).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Idempotency-Key header is required' });
        });
    });

    describe('getExpenses', () => {
        it('should return a list of expenses mapped correctly for the user', async () => {
            // ARRANGE
            const fakeUserId = 'user789';
            mockReq.user = { id: fakeUserId, email: 'fake@email.com' };
            mockReq.query = { sortOn: 'amount', sortDir: 'asc' };

            const mockDbExpenses = [
                { id: 'exp1', amount: 100, categoryId: 'cat1', description: 'Food', userId: fakeUserId, date: new Date(), createdAt: new Date(), updatedAt: new Date(), idempotencyKey: 'idem1' },
            ];

            prisma.expense.findMany.mockResolvedValue(mockDbExpenses);
            prisma.expense.count.mockResolvedValue(1);

            // ACT
            await getExpenses(mockReq as Request, mockRes as Response);

            // ASSERT
            expect(prisma.expense.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ userId: fakeUserId }),
                orderBy: { amount: 'asc' }
            }));

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ expenses: mockDbExpenses, hasMore: false });
        });
    });
});
