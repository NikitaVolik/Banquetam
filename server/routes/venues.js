// server/routes/venues.js

import express from 'express';
import { body } from 'express-validator';
import { getVenues, getVenueById, createVenue, deleteVenue } from '../controllers/venueController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', protect, getVenues);
router.get('/:id', protect, getVenueById);

router.post(
    '/',
    protect,
    adminOnly,
    [
        body('name').trim().notEmpty().withMessage('Название помещения обязательно').isLength({ min: 3, max: 150 }).withMessage('Название должно содержать от 3 до 150 символов'),
        body('type').trim().isIn(['Зал', 'Ресторан', 'Летняя веранда', 'Закрытая веранда']).withMessage('Выберите корректный тип помещения')
    ],
    createVenue
);

router.delete('/:id', protect, adminOnly, deleteVenue);

export default router;