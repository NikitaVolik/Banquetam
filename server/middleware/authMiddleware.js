// server/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Нет токена, доступ запрещён' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET
        );

        const [rows] = await pool.query(
          `
            SELECT
              id,
              login,
              full_name,
              phone_number,
              email,
              role
            FROM users
            WHERE id = ?
          `,
          [decoded.id]
        );

        const user = rows[0];

        if (!user) {
          return res.status(401).json({ message: 'Пользователь не найден' });
        }

        req.user = user;

        next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Срок действия токена истёк' });
      }

      return res.status(401).json({ message: 'Недействительный токен' });
    }
};