// server/routes/reservations.js

import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import { createReservation, getMyReservations } from '../controllers/reservationController.js';
import { isValidDateRu } from '../utils/date.js';

const router = express.Router();

router.get('/my', protect, getMyReservations);

router.post(
    '/',
    protect,
    [
        body('venueId').notEmpty().withMessage('Помещение обязательно').toInt().isInt({ min: 1 }).withMessage('Некорректное помещение'),
        body('eventDate').trim().notEmpty().withMessage('Дата обязательна').custom((value) => {
            if (!isValidDateRu(value)) {
                throw new Error('Дата должна быть в формате ДД.ММ.ГГГГ');
            }

            return true;
        }),
        body('paymentMethod').trim().isIn(['Наличные', 'Банковская карта']).withMessage('Выберите корректный способ оплаты')
    ],
    createReservation
);

export default router;