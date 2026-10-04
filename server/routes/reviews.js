// server/routes/reviews.js

import express from 'express';
import { body } from 'express-validator';
import { createReview, getReviewsByReservation } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
    '/',
    protect,
    [
        body('reservationId').notEmpty().withMessage('Заявка обязательна').toInt().isInt({ min: 1 }).withMessage('Некорректная заявка'),
        body('rating').notEmpty().withMessage('Оценка обязательна').toInt().isInt({ min: 1, max: 5 }).withMessage('Оценка должна быть от 1 до 5'),
        body('comment').trim().notEmpty().isLength({ min: 3, max: 1000 }).withMessage('Комментарий должен содержать от 3 до 1000 символов')
    ],
    createReview
);

router.get('/reservation/:reservationId', protect, getReviewsByReservation);

export default router;