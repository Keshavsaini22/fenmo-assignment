import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { getCategories } from '../../src/controllers/category.controller';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        category: {
            findMany: jest.fn(),
        }
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma)
    };
});

describe('Category Controller', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let prisma: any;

    beforeEach(() => {
        prisma = new PrismaClient();
        jest.clearAllMocks();

        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn() as any,
        };
    });

    describe('getCategories', () => {
        it('should return 200 with an array of category entities', async () => {
            // ARRANGE
            const mockCategories = [
                { id: 'cat-1', name: 'Food' },
                { id: 'cat-2', name: 'Travel' }
            ];
            prisma.category.findMany.mockResolvedValue(mockCategories);

            // ACT
            await getCategories(mockReq as Request, mockRes as Response);

            // ASSERT
            expect(prisma.category.findMany).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockCategories);
        });

        it('should return 500 when database throws an exception', async () => {
            // ARRANGE
            prisma.category.findMany.mockRejectedValue(new Error('DB failure'));

            // ACT
            await getCategories(mockReq as Request, mockRes as Response);

            // ASSERT
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });
});
