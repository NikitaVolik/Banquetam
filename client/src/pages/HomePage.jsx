// client/src/pages/HomePage.jsx

import "../styles/home.css"
import { Link } from "react-router-dom"
import Layout from "../components/layout/Layout.jsx"
import { useAuth } from "../context/AuthContext.jsx"

const venues = [
  {
    id: 1,
    name: 'Банкетный зал «Север»',
    type: 'Зал',
    price: 'от 1600 ₽',
    image: '/images/66155ef0748e9.webp',
    description: 'Светлый интерьер для свадеб, юбилеев и семейныйх торжеств.'
  },
  {
    id: 2,
    name: 'Ресторан «Тюмень Гранд»',
    type: 'Ресторан',
    price: 'от 1800 ₽',
    image: '/images/unnamed (2).webp',
    description: 'Классическая подача и просторный зал для праздничного ужина.'
  },
  {
    id: 3,
    name: 'Летняя веранда «Парк»',
    type: 'Летняя веранда',
    price: 'от 2300 ₽',
    image: '/images/1671649122_idei-club-p-veranda-.webp',
    description: 'Открытая площадка с зеленью и атмосферой летнего банкета.'
  },
  {
    id: 4,
    name: 'Закрытая веранда «Комфорт»',
    type: 'Закрытая веранда',
    price: 'от 1900 ₽',
    image: '/images/3505f015e0d26644e8e4c.webp',
    description: 'Светлый интерьер для свадеб, юбилеев и семейных торжеств.'
  }
]

export default function HomePage() {
  const { user } = useAuth()

  return (
    <Layout>
      <main className="container" tabIndex="-1">
        <section className="hero centered" aria-labelledby="heroTitle">
          <h1 id="heroTitle">Банкет без хлопот</h1>
          <p>Выберите подходящее помещение, отправьте заявку и отслеживайте её статус в личном кабинете.</p>
          <Link className="btn" to={user ? "/reservation" : "/register"}>
            {user ? "Оформить заявку" : "Зарегистрироваться"}
          </Link>
        </section>

        <section className="home-venues" aria-labelledby="venuesTitle">
          <h2 id="venuesTitle" className="section-title">Популярные помещения</h2>

          <div className="venues-grid">
            {venues.map((venue) => (
              <article className="venue-card" key={venue.id}>
                <img src={venue.image} alt={venue.name} width="800" height="500" loading="lazy" />
                <div className="venue-card-body">
                  <span className="venue-meta">{venue.type}</span>
                  <h3>{venue.name}</h3>
                  <p>{venue.description}</p>
                  <p className="venue-price">{venue.price}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="center-action">
            <Link className="btn" to={user ? "/reservation" : "/login"}>
              Забронировать помещение
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  )
}