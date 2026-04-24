import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { verifyToken } from '../services/auth.service';

export interface AuthRequest extends Request {
    user?: string | JwtPayload | object | any;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        try {
            const decoded = verifyToken(token);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
        }
    } else {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
};
