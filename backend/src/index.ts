import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import expenseRoutes from './routes/expense.routes';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ status: 'success', message: 'Fenmo Tracking API is fully online and reachable.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`Unhandled Exception: ${err.message}`);
    res.status(500).json({ error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
