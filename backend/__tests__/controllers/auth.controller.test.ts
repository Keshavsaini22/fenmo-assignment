import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { registerUser, loginUser } from '../../src/controllers/auth.controller';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import * as authService from '../../src/services/auth.service';

jest.mock('@prisma/client', () => {
    const mockPrisma = {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
        }
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma)
    };
});

jest.mock('../../src/services/auth.service', () => ({
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
    generateToken: jest.fn(),
}));

describe('Auth Controller', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let prisma: any;

    beforeEach(() => {
        prisma = new PrismaClient();
        jest.clearAllMocks();

        mockReq = {
            body: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn() as any,
        };
    });

    describe('registerUser', () => {
        it('should successfully register a new user returning generic JWT', async () => {
            // ARRANGE
            const payload = { email: 'test@example.com', password: 'password123', name: 'Keshav' };
            mockReq.body = payload;

            const fakeHashedPassword = 'hashed-secure-password';
            const mockDbUser = { id: 'u123', email: payload.email, name: payload.name };
            const fakeToken = 'fake.jwt.token';

            prisma.user.findUnique.mockResolvedValue(null);
            (authService.hashPassword as any).mockResolvedValue(fakeHashedPassword);
            prisma.user.create.mockResolvedValue(mockDbUser);
            (authService.generateToken as any).mockReturnValue(fakeToken);

            // ACT
            await registerUser(mockReq as Request, mockRes as Response);

            // ASSERT
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: payload.email } });
            expect(authService.hashPassword).toHaveBeenCalledWith(payload.password);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: payload.email,
                    password: fakeHashedPassword,
                    name: payload.name,
                }
            });
            expect(authService.generateToken).toHaveBeenCalledWith(mockDbUser.id, mockDbUser.email);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'User registered successfully',
                user: { id: mockDbUser.id, email: mockDbUser.email, name: mockDbUser.name },
                token: fakeToken
            });
        });

        it('should block registry if user already exists mapping to 400', async () => {
            // ARRANGE
            mockReq.body = { email: 'exist@example.com', password: 'password123', name: 'John' };
            prisma.user.findUnique.mockResolvedValue({ id: 'existing-id' }); // User exists

            // ACT
            await registerUser(mockReq as Request, mockRes as Response);

            // ASSERT
            expect(prisma.user.create).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'User already exists with this email.' });
        });
    });

    describe('loginUser', () => {
        it('should successfully issue a token resolving valid credentials', async () => {
            // ARRANGE
            mockReq.body = { email: 'john@example.com', password: 'password123' };
            const fakeToken = 'fake.token';
            const fakeDbUser = { id: 'u111', email: 'john@example.com', password: 'hashed!', name: 'John' };

            prisma.user.findUnique.mockResolvedValue(fakeDbUser);
            (authService.comparePassword as any).mockResolvedValue(true); // Password match!
            (authService.generateToken as any).mockReturnValue(fakeToken);

            // ACT
            await loginUser(mockReq as Request, mockRes as Response);

            // ASSERT
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: mockReq.body.email } });
            expect(authService.comparePassword).toHaveBeenCalledWith(mockReq.body.password, fakeDbUser.password);
            expect(authService.generateToken).toHaveBeenCalledWith(fakeDbUser.id, fakeDbUser.email);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Login successful',
                user: { id: fakeDbUser.id, email: fakeDbUser.email, name: fakeDbUser.name },
                token: fakeToken,
            });
        });

        it('should throw 401 Unauthorized for bad login mapping combinations', async () => {
            // ARRANGE
            mockReq.body = { email: 'bad@example.com', password: 'wrong' };
            prisma.user.findUnique.mockResolvedValue({ id: 'u111', password: 'different-hash' });
            (authService.comparePassword as any).mockResolvedValue(false); // Password mismatch validation

            // ACT
            await loginUser(mockReq as Request, mockRes as Response);

            // ASSERT
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid email or password' });
        });
    });
});
