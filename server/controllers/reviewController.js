// server/controllers/reviewController.js

import { matchedData, validationResult } from "express-validator";
import pool from "../config/database.js";
import { RESERVATION_STATUSES } from "../constants/reservationStatuses.js";

const mapReview = (row) => ({
  id: row.id,
  reservationId: row.reservation_id,
  userId: row.user_id,
  venueId: row.venue_id,
  rating: Number(row.rating),
  comment: row.comment,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const createReview = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const connection = await pool.getConnection();

  try {
    const { reservationId, rating, comment } = matchedData(req);

    await connection.beginTransaction();

    const [reservationRows] = await connection.query(
      `
        SELECT id, user_id, venue_id, status
        FROM reservations
        WHERE id = ?
      `,
      [reservationId]
    );

    const reservation = reservationRows[0];

    if (!reservation) {
      await connection.rollback();
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    if (Number(reservation.user_id) !== Number(req.user.id)) {
      await connection.rollback();
      return res.status(403).json({ message: 'Нет доступа к отзыву по этой заявке' });
    }

    if (reservation.status !== RESERVATION_STATUSES.COMPLETED) {
      await connection.rollback();
      return res.status(400).json({ message: 'Отзыв можно оставить только после завершения банкета' });
    }

    const [existingReviews] = await connection.query(
      `
        SELECT id
        FROM reviews
        WHERE reservation_id = ?
      `,
      [reservationId]
    );

    if (existingReviews.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Отзыв по этой заявке уже существует' });
    }

    const [result] = await connection.query(
      `
        INSERT INTO reviews
          (
            reservation_id,
            user_id,
            venue_id,
            rating,
            comment
          )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        reservationId,
        req.user.id,
        reservation.venue_id,
        rating,
        comment
      ]
    );

    const [reviewRows] = await connection.query(
      `
        SELECT
          id,
          reservation_id,
          user_id,
          venue_id,
          rating,
          comment,
          created_at,
          updated_at
        FROM reviews
        WHERE id = ?
      `,
      [result.insertId]
    );
    
    await connection.commit();

    return res.status(201).json({
      message: 'Отзыв успешно сохранён',
      review: mapReview(reviewRows[0])
    });
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось сохранить отзыв' });
  } finally {
    connection.release();
  }
};

export const getReviewsByReservation = async (req, res) => {
  try {
    const reservationId = Number(req.params.reservationId);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({ message: 'Некорректный идентификатор заявки' });
    }

    const [reservationRows] = await pool.query(
      `
        SELECT id, user_id
        FROM reservations
        WHERE id = ?
      `,
      [reservationId]
    );

    const reservation = reservationRows[0];

    if (!reservation) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const isOwner = Number(reservation.user_id) === Number(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Нет доступа к отзывам по этой заявке' });
    }

    const [rows] = await pool.query(
      `
        SELECT
          id,
          reservation_id,
          user_id,
          venue_id,
          rating,
          comment,
          created_at,
          updated_at
        FROM reviews
        WHERE reservation_id = ?
        ORDER BY created_at DESC
      `,
      [reservationId]
    );

    return res.json(rows.map(mapReview));
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось загрузить отзывы' });
  }
};