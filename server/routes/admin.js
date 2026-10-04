// server/routes/admin.js

import express from 'express';
import { getAllReservations, updateReservationStatus } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/reservations', protect, adminOnly, getAllReservations);
router.put('/reservations/:id/status', protect, adminOnly, updateReservationStatus);

export default router;