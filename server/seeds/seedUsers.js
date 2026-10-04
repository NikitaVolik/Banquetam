// server/seeds/seedUsers.js

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

dotenv.config();

const users = [
  {
    login: 'Admin26',
    password: 'Demo20',
    fullName: 'Администратор системы',
    phoneNumber: '+70000000000',
    email: 'admin26@banquetam.local',
    role: 'admin'
  },
  {
    login: 'User123',
    password: 'Password123',
    fullName: 'Иван Иванов',
    phoneNumber: '+79991234567',
    email: 'user123@banquetam.local',
    role: 'user'
  }
]

const seedUsers = async () => {
    try {
        for (const user of users) {
          const passwordHash = await bcrypt.hash(user.password, 10);

          await pool.query(
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
              user.login,
              passwordHash,
              user.fullName,
              user.phoneNumber,
              user.email,
              user.role
            ]
          );
        }

        console.log('Пользователи успешно добавлены');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка начальных данных пользователей:', error);

        process.exit(1);
    }
};

seedUsers();