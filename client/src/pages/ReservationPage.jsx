// client/src/pages/ReservationPage.jsx

import { useEffect, useState } from "react"
import Layout from "../components/layout/Layout.jsx"
import venueService from "../services/venueService.js"
import reservationService from "../services/reservationService.js"
import { normalizeDateInput } from "../utils/date.js"
import { useAuth } from "../context/AuthContext.jsx"

export default function ReservationPage() {
  const { token } = useAuth()

  const [venues, setVenues] = useState([])
  const [form, setForm] = useState({
    venueId: '',
    eventDate: '',
    paymentMethod: 'Банковская карта'
  })

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadVenues() {
      try {
        setError('')
        const data = await venueService.getAll(token)
        setVenues(Array.isArray(data) ? data : data.items || [])
      } catch (err) {
        setError(err.message)
      }
    }

    if (token) {
      loadVenues()
    }
  }, [token])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: name === 'eventDate' ? normalizeDateInput(value) : value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      const data = await reservationService.create(
        {
          venueId: Number(form.venueId),
          eventDate: form.eventDate,
          paymentMethod: form.paymentMethod
        },
        token
      )

      setMessage(data.message || 'Заявка успешно создана')
      setForm({
        venueId: '',
        eventDate: '',
        paymentMethod: 'Банковская карта'
      })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Layout>
      <main className="container" tabIndex="-1">
        <section className="hero" aria-labelledby="reservationTitle">
          <h1 id="reservationTitle">Бронирование помещения</h1>
          <p>Выберите зал, дату проведения и способ оплаты.</p>
        </section>

        <section className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="venueId"><span>Помещение</span></label>
              <select
                id="venueId"
                name="venueId"
                value={form.venueId}
                onChange={handleChange}
                required
              >
                <option value="">Выберите помещение</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} — {venue.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="eventDate"><span>Пароль</span></label>
              <input
                id="eventDate"
                name="eventDate"
                type="text"
                placeholder="ДД.ММ.ГГГГ"
                value={form.eventDate}
                onChange={handleChange}
                maxLength={10}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="paymentMethod"><span>Способ оплаты</span></label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="Банковская карта">Банковская карта</option>
                <option value="Наличные">Наличные</option>
              </select>
            </div>

            {error ? <p className="form-error">{error}</p> : null}
            {message ? <p className="form-message">{message}</p> : null}

            <button type="submit" className="btn">
              Отправить заявку
            </button>
          </form>
        </section>
      </main>
    </Layout>
  )
}