// server/app.js

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import venueRoutes from './routes/venues.js';
import reservationRoutes from './routes/reservations.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET не определён');
};

connectDB();

const app = express();

app.disable('x-powered-by');

app.use(helmet());

app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Маршрут не найден' });
});

app.use((err, req, res, next) => {
    console.error(err.stack)

    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера!' : (err.message || 'Внутренняя ошибка сервера!')
    });
});

export default app;