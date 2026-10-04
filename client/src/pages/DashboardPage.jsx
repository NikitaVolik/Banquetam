// client/src/pages/DashboardPage.jsx

import "../styles/dashboard.css"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/layout/Layout.jsx"
import HeroSlider from "../components/common/HeroSlider.jsx"
import reservationService from "../services/reservationService.js"
import reviewService from "../services/reviewService.js"
import { formatDateRu } from "../utils/date.js"
import { useAuth } from "../context/AuthContext.jsx"

function getStatusClass(status) {
  if (status === 'Новая') return 'status-badge status-new'
  if (status === 'Банкет назначен') return 'status-badge status-assigned'
  if (status === 'Банкет завершен') return 'status-badge status-completed'
  return 'status-badge'
}

export default function DashboardPage() {
  const { token } = useAuth()

  const [reservations, setReservations] = useState([])
  const [pageError, setPageError] = useState('')
  const [reviewText, setReviewText] = useState({})
  const [reviewRating, setReviewRating] = useState({})
  const [reviewErrors, setReviewErrors] = useState({})
  const [reviewMessages, setReviewMessages] = useState({})
  const [submittingReviewId, setSubmittingReviewId] = useState({})

  useEffect(() => {
    async function loadReservations() {
      try {
        setPageError('')
        const data = await reservationService.getMy(token)
        const items = Array.isArray(data) ? data : data.items
        setReservations(items)

        const initialTexts = {}
        const initialRatings = {}

        items.forEach((item) => {
          if (item.review) {
            initialTexts[item.id] = item.review.comment
            initialRatings[item.id] = String(item.review.rating || 5)
          } else {
            initialTexts[item.id] = ''
            initialRatings[item.id] = '5'
          }
        })
        
        setReviewText(initialTexts)
        setReviewRating(initialRatings)
      } catch (err) {
        setPageError(err.message)
      }
    }

    if (token) {
      loadReservations()
    }
  }, [token])
  
  const activeReservations = useMemo(
    () => reservations.filter((item) => item.status === 'Банкет назначен').length,
    [reservations]
  )

  const completeReservations = useMemo(
    () => reservations.filter((item) => item.status === 'Банкет завершен').length,
    [reservations]
  )

  const handleReviewChange = (id, value) => {
    setReviewText((prev) => ({ ...prev, [id]: value }))
    setReviewErrors((prev) => ({ ...prev, [id]: '' }))
    setReviewMessages ((prev) => ({ ...prev, [id]: '' }))
  }

  const handleRatingChange = (id, value) => {
    setReviewRating((prev) => ({ ...prev, [id]: value }))
    setReviewErrors((prev) => ({ ...prev, [id]: '' }))
    setReviewMessages ((prev) => ({ ...prev, [id]: '' }))
  }

  const submitReview = async (reservationId) => {
    const comment = (reviewText[reservationId] || '').trim()
    const rating = Number(reviewRating[reservationId] || 5)

    setReviewErrors((prev) => ({ ...prev, [reservationId]: '' }))
    setReviewMessages ((prev) => ({ ...prev, [reservationId]: '' }))

    if (!comment) {
      setReviewErrors((prev) => ({
        ...prev,
        [reservationId]: 'Введите текст отзыва'
      }))
      return
    }

    try {
      setSubmittingReviewId(reservationId)
      
      const data = await reviewService.create(
        { reservationId, rating, comment },
        token
      )

      const updatedReview = data.review

      setReviewMessages((prev) => ({
        ...prev,
        [reservationId]: data.message || 'Отзыв сохранён'
      }))

      setReservations((prev) => prev.map((item) => item.id === reservationId ? {
        ...item,
        hasReview: true,
        reviewId: updatedReview?.id || reservationId,
        review: updatedReview || { rating, comment }
      } : item))
    } catch (err) {
      setReviewErrors((prev) => ({
        ...prev,
        [reservationId]: err.message
      }))
    } finally {
      setSubmittingReviewId(null)
    }
  }

  return (
    <Layout>
      <HeroSlider />
      <main className="container" tabIndex="-1">
        <section className="hero" aria-labelledby="dashboardTitle">
          <h1 id="dashboardTitle">Личный кабинет</h1>
          <p>Ваши заявки и отзывы по завершённым банкетам.</p>
        </section>

        <section className="dashboard-stats" aria-label="Статистика пользователя">
          <article className="stat-card">
            <span className="stat-label">Всего заявок</span>
            <strong className="stat-value">{reservations.length}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Новые</span>
            <strong className="stat-value">{activeReservations}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Завершённые</span>
            <strong className="stat-value">{completeReservations}</strong>
          </article>
        </section>

        {pageError ? <p className="form-error">{pageError}</p> : null}

        <section className="cards" aria-labelledby="reservationsTitle">
          <h2 id="reservationsTitle" className="section-title">Мои заявки</h2>

          {reservations.length === 0 ? (
            <article className="empty-card">
              <h3>Заявок пока нет</h3>
              <p>Оформите первую бронь помещения.</p>
              <Link to="/reservation" className="btn">Перейти к бронированию</Link>
            </article>
          ) : (
            reservations.map((item) => {
              const reservationId = item.id
              const venueName = item.venueName || item.venueId?.name
              const venueType = item.venueType || item.venueId?.type
              const canReview = item.status === 'Банкет завершен'
              const hasReview = Boolean(item.review || item.reviewId || item.hasReview)
              const review = item.review || null
              const isSubmitting = submittingReviewId === reservationId
              const ratingFieldId = `review-rating-${reservationId}`
              const textFieldId = `review-text-${reservationId}`

              return (
                <article className="reservation-card reservation-card-wide" key={reservationId}>
                  <div className="reservation-card-top">
                    <div>
                      <p className="card-eyebrow">{venueType}</p>
                      <h3>{venueName}</h3>
                    </div>
                    <span className={getStatusClass(item.status)}>{item.status}</span>
                  </div>

                  <div className="reservation-info-grid">
                    <p><strong>Дата банкета:</strong> {formatDateRu(item.eventDate)}</p>
                    <p><strong>Дата бронирования:</strong> {formatDateRu(item.reservationDate)}</p>
                    <p><strong>Способ оплаты:</strong> {item.paymentMethod}</p>
                  </div>

                  {hasReview && review ? (
                    <div className="review-block review-result">
                      <p><strong>Оценка:</strong> {review.rating}/5</p>
                      <p><strong>Комментарий:</strong> {review.comment}</p>
                    </div>
                  ) : null}

                  {canReview && !hasReview ? (
                    <div className="review-block">
                      <div className="field">
                        <label htmlFor={ratingFieldId}><span>Оценка</span></label>
                        <select
                          id={ratingFieldId}
                          value={reviewRating[reservationId] || "5"}
                          onChange={(e) => handleRatingChange(reservationId, e.target.value)}
                          disabled={isSubmitting}
                        >
                          <option value="5">5</option>
                          <option value="4">4</option>
                          <option value="3">3</option>
                          <option value="2">2</option>
                          <option value="1">1</option>
                        </select>
                      </div>

                      <div className="field">
                        <label htmlFor={textFieldId}><span>Оценка</span></label>
                        <textarea
                          id={textFieldId}
                          placeholder="Поделитесь впечатлениями"
                          value={reviewText[reservationId] || ""}
                          onChange={(e) => handleReviewChange(reservationId, e.target.value)}
                          disabled={isSubmitting}
                        />

                        {reviewErrors[reservationId] ? (
                          <p className="form-error">{reviewErrors[reservationId]}</p>
                        ) : null}

                        {reviewMessages[reservationId] ? (
                          <p className="form-message">{reviewMessages[reservationId]}</p>
                        ) : null}

                        <button
                          type="button"
                          className="btn"
                          onClick={() => submitReview(reservationId)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Сохранение..." : "Сохранить отзыв"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              )
            })
          )}
        </section>
      </main>
    </Layout>
  )
}