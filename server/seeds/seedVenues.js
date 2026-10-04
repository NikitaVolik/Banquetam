// server/seeds/seedVenues.js

import dotenv from 'dotenv';
import pool from '../config/database.js';

dotenv.config();

const venues = [
  {
    name: 'Банкетный зал «Север»',
    type: 'Зал'
  },
  {
    name: 'Ресторан «Тюмень Гранд»',
    type: 'Ресторан'
  },
  {
    name: 'Летняя веранда «Парк»',
    type: 'Летняя веранда'
  },
  {
    name: 'Закрытая веранда «Комфорт»',
    type: 'Закрытая веранда'
  }
]

const seedVenues = async () => {
    try {
        for (const venue of venues) {

          await pool.query(
            `
              INSERT INTO venues
                (
                  name,
                  type
                )
              VALUES (?, ?)
            `,
            [
              venue.name,
              venue.type
            ]
          );
        }

        console.log('Помещения успешно добавлены');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка начальных данных помещений:', error);

        process.exit(1);
    }
};

seedVenues();