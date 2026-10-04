// server/controllers/adminController.js

import pool from "../config/database.js";
import { RESERVATION_STATUSES, RESERVATION_STATUS_VALUES } from "../constants/reservationStatuses.js";

const mapReservation = (row) => ({
  id: row.id,
  reservationDate: row.reservation_date,
  eventDate: row.event_date,
  paymentMethod: row.payment_method,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  venueId: {
    id: row.venue_id,
    name: row.venue_name,
    type: row.venue_type
  },
  userId: {
    id: row.user_id,
    login: row.user_login,
    fullName: row.user_full_name,
    phoneNumber: row.user_phone_number,
    email: row.user_email
  }
});

const getReservationQuery = (whereSql = '') => `
  SELECT
    r.id,
    r.user_id,
    r.venue_id,
    r.reservation_date,
    r.event_date,
    r.payment_method,
    r.status,
    r.created_at,
    r.updated_at,
    v.name AS venue_name,
    v.type AS venue_type,
    u.login AS user_login,
    u.full_name AS user_full_name,
    u.phone_number AS user_phone_number,
    u.email AS user_email
  FROM reservations r
  JOIN venues v ON v.id = r.venue_id
  JOIN users u ON u.id = r.user_id
  ${whereSql}
`;

export const getAllReservations = async (req, res) => {
  try {
    const where = [];
    const params = [];

    if (req.query.status && req.query.status !== 'Все' && RESERVATION_STATUS_VALUES.includes(req.query.status)) {
      where.push('r.status = ?');
      params.push(req.query.status);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `
        ${getReservationQuery(whereSql)}
        ORDER BY r.event_date DESC, r.created_at DESC
      `,
      params
    );

    return res.json(rows.map(mapReservation));
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка получения всех заявок' });
  }
};

export const updateReservationStatus = async (req, res) => {
  try {
    const reservationId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({ message: 'Некорректный идентификатор заявки' });
    }

    if (!RESERVATION_STATUS_VALUES.includes(status)) {
      return res.status(400).json({ message: 'Некорректный статус' });
    }

    const [rows] = await pool.query(
      `
        SELECT id, status
        FROM reservations
        WHERE id = ?
      `,
      [reservationId]
    );

    const reservation = rows[0];

    if (!reservation) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const allowedTransitions = {
      [RESERVATION_STATUSES.NEW]: [RESERVATION_STATUSES.ASSIGNED],
      [RESERVATION_STATUSES.ASSIGNED]: [RESERVATION_STATUSES.COMPLETED],
      [RESERVATION_STATUSES.COMPLETED]: []
    }

    const allowedStatuses = allowedTransitions[reservation.status] || [];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Нельзя изменить статус с ${reservation.status} на ${status}` });
    }

    await pool.query(
      `
        UPDATE reservations
        SET status = ?
        WHERE id = ?
      `,
      [status, reservationId]
    );

    const [updatedRows] = await pool.query(
      getReservationQuery('WHERE r.id = ?'),
      [reservationId]
    );

    return res.json({
      message: 'Статус обновлён',
      reservation: mapReservation(updatedRows[0])
    });
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка обновления статуса' });
  }
};