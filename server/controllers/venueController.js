// server/controllers/venueController.js

import { validationResult } from "express-validator";
import pool from "../config/database.js";

export const getVenues = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
        SELECT id, name, type
        FROM venues
        ORDER BY name ASC
      `
    );

    return res.json(
      rows.map((venue) => ({
        id: venue.id,
        name: venue.name,
        type: venue.type
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось загрузить помещения' });
  }
};

export const getVenueById = async (req, res) => {
  try {
    const venueId = Number(req.params.id);

    if (!Number.isInteger(venueId) || venueId <= 0) {
      return res.status(400).json({ message: 'Некорректный идентификатор помещения' });
    }

    const [rows] = await pool.query(
      `
        SELECT id, name, type
        FROM venues
        WHERE id = ?
      `,
      [venueId]
    );

    const venue = rows[0];

    if (!venue) {
      return res.status(404).json({ message: 'Помещение не найдено' });
    }

    return res.json({
      id: venue.id,
      name: venue.name,
      type: venue.type
    });
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось загрузить помещения' });
  }
};

export const createVenue = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const name = String(req.body.name).trim();
    const type = String(req.body.type).trim();

    const [existingRows] = await pool.query(
      `
        SELECT id, name, type
        FROM venues
        WHERE name = ? AND type = ?
      `,
      [name, type]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({ message: 'Такое помещение уже существует' });
    }

    const [result] = await pool.query(
      `
        INSERT INTO venues (name, type)
        VALUES (?, ?)
      `,
      [name, type]
    );

    return res.status(201).json({
      message: 'Помещение успешно создано',
      venue: {
        id: result.insertId,
        name,
        type
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось создать помещение' });
  }
};

export const deleteVenue = async (req, res) => {
  try {
    const venueId = Number(req.params.id);

    if (!Number.isInteger(venueId) || venueId <= 0) {
      return res.status(400).json({ message: 'Некорректный идентификатор помещения' });
    }

    const [rows] = await pool.query(
      `
        SELECT id
        FROM venues
        WHERE id = ?
      `,
      [venueId]
    );

    const venue = rows[0];

    if (!venue) {
      return res.status(404).json({ message: 'Помещение не найдено' });
    }

    const [reservationRows] = await pool.query(
      `
        SELECT id
        FROM reservations
        WHERE venue_id = ?
        LIMIT 1
      `,
      [venueId]
    );
    
    if (reservationRows.length > 0) {
      return res.status(400).json({ message: 'Нельзя удалить помещение, по которому уже существуют заявки' });
    }

    await pool.query(
      `
        DELETE FROM venues
        WHERE id = ?
      `,
      [venueId]
    );

    return res.status(201).json({ message: 'Помещение успешно удалено' });
  } catch (error) {
    return res.status(500).json({ message: 'Не удалось удалить помещение' });
  }
};