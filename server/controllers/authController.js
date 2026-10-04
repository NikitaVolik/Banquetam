// server/controllers/authController.js

import { matchedData, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/database.js";

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

const mapUser = (user) => ({
  id: user.id,
  login: user.login,
  fullName: user.full_name,
  phoneNumber: user.phone_number,
  email: user.email,
  role: user.role
});

export const registerUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      login,
      password,
      fullName,
      phoneNumber,
      email
    } = matchedData(req);

    const [existingUsers] = await pool.query(
      `
        SELECT id
        FROM users
        WHERE login = ? OR email = ?
      `,
      [login, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Логин или email уже используются' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `
        INSERT INTO users
          (
            login,
            password_hash,
            full_name,
            phone_number,
            email,
            role
          )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        login,
        passwordHash,
        fullName,
        phoneNumber,
        email,
        'user'
      ]
    );

    const user = {
      id: result.insertId,
      login,
      full_name: fullName,
      phone_number: phoneNumber,
      email,
      role: 'user'
    }

    return res.status(201).json({
      message: 'Пользователь зарегистрирован',
      token: generateToken(user.id),
      user: mapUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка регистрации' });
  }
};

export const loginUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { login, password } = matchedData(req);

    const [rows] = await pool.query(
      `
        SELECT
          id,
          login,
          password_hash,
          full_name,
          phone_number,
          email,
          role
        FROM users
        WHERE login = ?
      `,
      [login]
    );
    
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Неверный логин или пароль' });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Неверный логин или пароль' });
    }

    return res.status(200).json({
      message: 'Успешный вход',
      token: generateToken(user.id),
      user: mapUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка авторизации' });
  }
};

export const checkLogin = async (req, res) => {

  try {
    const login = String(req.query.login || '').trim();

    if (!login) {
      return res.status(400).json({ message: 'Логин не указан' });
    }

    const [rows] = await pool.query(
      `
        SELECT id
        FROM users
        WHERE login = ?
      `,
      [login]
    );

    return res.json({
      exists: rows.length > 0
    });
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка проверки логина' });
  }
};