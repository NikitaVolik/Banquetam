// server/routes/auth.js

import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, checkLogin } from '../controllers/authController.js';

const router = express.Router();

router.post(
    '/register',
    [
        body('login').trim().notEmpty().withMessage('Логин обязателен').isLength({ min: 6 }).withMessage('Логин должен быть не менее 6 символов').matches(/^[A-Za-z0-9]+$/).withMessage('Логин должен содержать только латинские буквы и цифры'),
        body('password').notEmpty().withMessage('Пароль обязателен').isLength({ min: 8 }).withMessage('Пароль должен быть не менее 8 символов'),
        body('fullName').trim().notEmpty().withMessage('ФИО обязательно'),
        body('phoneNumber').trim().notEmpty().withMessage('Телефон обязателен').isLength({ min: 10, max: 20 }).withMessage('Номер телефона должен содержать от 10 до 20 символов').matches(/^\+?[0-9\s\-()]{10,20}$/).withMessage('Введите корректный номер телефона'),
        body('email').trim().normalizeEmail().notEmpty().withMessage('Email обязателен').isEmail().withMessage('Введите корректный email')
    ],
    registerUser
);

router.post(
    '/login',
    [
        body('login').trim().notEmpty().withMessage('Введите логин'),
        body('password').notEmpty().withMessage('Введите пароль')
    ],
    loginUser
);

router.get('/check-login', checkLogin);

export default router;