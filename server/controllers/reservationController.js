// server/controllers/reservationController.js

import { matchedData, validationResult } from "express-validator";
import pool from "../config/database.js";
import { RESERVATION_STATUSES } from "../constants/reservationStatuses.js";
import { ruDateToSqlDate, isTodayOrFutureSqlDate } from "../utils/date.js";

const mapReview = (row) => {
  if (!row.review_id) {
    return null;
  }
  
  return {
    id: row.review_id,
    reservationId: row.review_reservation_id,
    userId: row.review_user_id,
    venueId: row.review_venue_id,
    rating: Number(row.review_rating),
    comment: row.review_comment,
    createdAt: row.review_created_at,
    updatedAt: row.review_updated_at
  }
};

const mapReservation = (row) => ({
  id: row.id,
  userId: row.user_id,
  venueId: row.venue_id,
  reservationDate: row.reservation_date,
  eventDate: row.event_date,
  paymentMethod: row.payment_method,
  status: row.status,
  createdAt: row.created_at,
  venueName: row.venue_name,
  venueType: row.venue_type,
  hasReview: Boolean(row.review_id),
  reviewId: row.review_id || null,
  review: mapReview(row)
});

export const createReservation = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { venueId, eventDate, paymentMethod } = matchedData(req);

    const [venueRows] = await pool.query(
      `
        SELECT id
        FROM venues
        WHERE id = ?
      `,
      [venueId]
    );

    if (venueRows.length === 0) {
      return res.status(400).json({ message: 'Выбранное помещение не найдено' });
    }

    const sqlEventDate = ruDateToSqlDate(eventDate);

    if (!isTodayOrFutureSqlDate(sqlEventDate)) {
      return res.status(400).json({ message: 'Дата банкета не может быть в прошлом' });
    }

    const [result] = await pool.query(
      `
        INSERT INTO reservations
          (
            user_id,
            venue_id,
            reservation_date,
            event_date,
            payment_method,
            status
          )
        VALUES (?, ?, CURDATE(), ?, ?, ?)
      `,
      [
        req.user.id,
        venueId,
        sqlEventDate,
        paymentMethod,
        RESERVATION_STATUSES.NEW
      ]
    );

    const [rows] = await pool.query(
      `
        SELECT
          r.id,
          r.user_id,
          r.venue_id,
          r.reservation_date,
          r.event_date,
          r.payment_method,
          r.status,
          r.created_at,
          v.name AS venue_name,
          v.type AS venue_type,
          NULL AS review_id,
          NULL AS review_reservation_id,
          NULL AS review_user_id,
          NULL AS review_venue_id,
          NULL AS review_rating,
          NULL AS review_comment,
          NULL AS review_created_at,
          NULL AS review_updated_at
        FROM reservations r
        JOIN venues v ON v.id = r.venue_id
        WHERE r.id = ?
      `,
      [result.insertId]
    );

    return res.status(201).json({
      message: 'Заявка успешно оформлена',
      reservation: mapReservation(rows[0])
    });
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось создать заявку' });
  }
};

export const getMyReservations = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
        SELECT
          r.id,
          r.user_id,
          r.venue_id,
          r.reservation_date,
          r.event_date,
          r.payment_method,
          r.status,
          r.created_at,
          v.name AS venue_name,
          v.type AS venue_type,
          rw.id AS review_id,
          rw.reservation_id AS review_reservation_id,
          rw.user_id AS review_user_id,
          rw.venue_id AS review_venue_id,
          rw.rating AS review_rating,
          rw.comment AS review_comment,
          rw.created_at AS review_created_at,
          rw.updated_at AS review_updated_at
        FROM reservations r
        JOIN venues v ON v.id = r.venue_id
        LEFT JOIN reviews rw ON rw.reservation_id = r.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
      `,
      [req.user.id]
    );

    return res.json(rows.map(mapReservation));
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось загрузить заявки' });
  }
};