// client/src/pages/AdminPage.jsx

import "../styles/admin.css"
import { useEffect, useMemo, useState } from "react"
import Layout from "../components/layout/Layout.jsx"
import adminService from "../services/adminService.js"
import venueService from "../services/venueService.js"
import { formatDateRu } from "../utils/date.js"
import { useAuth } from "../context/AuthContext.jsx"

const statusOptions = ['Новая', 'Банкет назначен', 'Банкет завершен']
const venueTypeOptions = ['Зал', 'Ресторан', 'Летняя веранда', 'Закрытая веранда']

function getStatusClass(status) {
  if (status === 'Новая') return 'status-badge status-new'
  if (status === 'Банкет назначен') return 'status-badge status-assigned'
  if (status === 'Банкет завершен') return 'status-badge status-completed'
  return 'status-badge'
}

function getNextStatuses(status) {
  if (status === 'Новая') return ['Банкет назначен']
  if (status === 'Банкет назначен') return ['Банкет завершен']
  return []
}

export default function AdminPage() {
  const { token } = useAuth()

  const [reservations, setReservations] = useState([])
  const [venues, setVenues] = useState([])
  const [draftStatuses, setDraftStatuses] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortDirection, setSortDirection] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [venueForm, setVenueForm] = useState({
    name: '',
    type: venueTypeOptions[0]
  })
  const [venueSubmitting, setVenueSubmitting] = useState(false)
  const [deletingVenueId, setDeletingVenueId] = useState(null)

  const pageSize = 4
  
  const loadReservations = async (status = statusFilter) => {
    try {
      setError('')
      setMessage('')
      const data = await adminService.getReservations(status ? status : '', token)
      const items = Array.isArray(data) ? data : data.items || []
      setReservations(items)
      setDraftStatuses({})
    } catch (err) {
      setError(err.message)
    }
  }

  const loadVenues = async () => {
    try {
      const data = await venueService.getAll(token)
      const items = Array.isArray(data) ? data : data.items || []
      setVenues(items)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    if (token) {
      loadReservations(statusFilter),
      loadVenues()
    }
  }, [statusFilter, token])
  
  const filteredReservations = useMemo(() => {
    return [...reservations].sort((a, b) => {
      const first = String(a.eventDate)
      const second = String(b.eventDate)
      return sortDirection === 'asc' ? first.localeCompare(second) : second.localeCompare(first)
    })
  }, [reservations, sortDirection])

  const totalReservations = reservations.length
  const newCount = reservations.filter((item) => item.status === 'Новая').length
  const completedCount = reservations.filter((item) => item.status === 'Банкет завершен').length

  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedReservations = filteredReservations.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  )

  const handleDraftStatusChange = (id, value) => {
    setDraftStatuses((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  const saveStatus = async (id, currentStatus) => {
    const nextStatus = draftStatuses[id]

    if (!nextStatus || nextStatus === currentStatus) {
      setError('Выберите новый допустимый статус')
      return
    }

    try {
      setError('')
      setMessage('')
      
      const data = await adminService.updateStatus(id, nextStatus, token)

      setReservations((prev) => prev.map((item) => item.id === id ? { ...item, status: data.reservation.status } : item))

      setDraftStatuses((prev) => {
        const copy = { ...prev }
        delete copy[id]
        return copy
      })
      
      setMessage(data.message || 'Статус заявки обновлён')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleVenueFormChange = (event) => {
    const { name, value } = event.target
    setVenueForm((prev) => ({
      ...prev,
      [name]: value
    }))
    setError('')
    setMessage('')
  }

  const handleVenueCreate = async (event) => {
    event.preventDefault()
    
    const payload = {
      name: venueForm.name.trim(),
      type: venueForm.type
    }

    if (!payload.name || !payload.type) {
      setError('Заполните данные помещения')
      return
    }

    try {
      setVenueSubmitting(true)
      setError('')
      setMessage('')

      const data = await venueService.create(payload, token)
      const createdVenue = data.venue

      setVenues((prev) => [...prev, createdVenue].sort((a, b) => a.name.localeCompare(b.name, 'ru')))

      setVenueForm({
        name: '',
        type: venueTypeOptions[0]
      })

      setMessage(data.message || 'Помещение добавлено')
    } catch (err) {
      setError(err.message)
    } finally {
      setVenueSubmitting(false)
    }
  }

  const handleVenueDelete = async (id) => {
    const confirmed = window.confirm('Удалить помещение')
    if (!confirmed) return

    try {
      setDeletingVenueId(id)
      setError('')
      setMessage('')

      const data = await venueService.remove(id, token)

      setVenues((prev) => prev.filter((item) => item.id !== id))
      setMessage(data.message || 'Помещение удалено')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingVenueId(false)
    }
  }

  return (
    <Layout>
      <main className="container" tabIndex="-1">
        <section className="hero" aria-labelledby="adminTitle">
          <h1 id="adminTitle">Панель администратора</h1>
          <p>Просмотр заявок, фильтрация, изменение статусов и управление помещениями.</p>
        </section>

        <section className="dashboard-stats" aria-label="Статистика заявок">
          <article className="stat-card">
            <span className="stat-label">Всего заявок</span>
            <strong className="stat-value">{totalReservations}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Новые</span>
            <strong className="stat-value">{newCount}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Завершённые</span>
            <strong className="stat-value">{completedCount}</strong>
          </article>
        </section>

        <section className="form-card admin-toolbar" aria-label="Фильтрация заявок">
          <div className="admin-toolbar-grid">
            <label className="field">
              <span>Фильтр по статусу</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">Все</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Сортировка по дате</span>
              <select
                value={sortDirection}
                onChange={(e) => {
                  setSortDirection(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="desc">Сначала ближайшие новые</option>
                <option value="asc">Сначала более ранние</option>
              </select>
            </label>
          </div>
        </section>

        <section className="form-card admin-toolbar" aria-labelledby="venueManageTitle">
          <h2 id="venueManageTitle" className="section-title">Управление помещениями</h2>

            <form onSubmit={handleVenueCreate}>
              <div className="admin-toolbar-grid">
                <label className="field">
                  <span>Название помещения</span>
                  <input
                    type="text"
                    name="name"
                    value={venueForm.name}
                    onChange={handleVenueFormChange}
                    placeholder="Введите название помещения"
                    required
                  />
                </label>

                <label className="field">
                  <span>Сортировка по дате</span>
                  <select
                    name="type"
                    value={venueForm.type}
                    onChange={handleVenueFormChange}
                  >
                    {venueTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button type="submit" className="btn" disabled={venueSubmitting}>
                {venueSubmitting ? "Добавление..." : "Добавить помещение"}
              </button>
            </form>

          <div className="cards">
            {venues.length === 0 ? (
              <article className="empty-card">
                <h3>Помещений пока нет</h3>
                <p>Добавьте первое помещение через форму выше.</p>
              </article>
            ) : (
              venues.map((venue) => (
                <article className="admin-card" key={venue.id}>
                  <div className="reservation-card-top">
                    <div>
                      <p className="card-eyebrow">{venue.type}</p>
                      <h3>{venue.name}</h3>
                    </div>
                  </div>

                  <div className="status-actions">
                    <button
                      type="submit"
                      className="btn"
                      onClick={() => handleVenueDelete(venue.id)}
                      disabled={deletingVenueId === venue.id}
                    >
                      {deletingVenueId === venue.id ? "Удаление..." : "Удалить помещение"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="form-message">{message}</p> : null}

        <section className="admin-list" aria-labelledby="adminListTitle">
          <h2 id="adminListTitle" className="section-title">Список заявок</h2>

          {paginatedReservations.length === 0 ? (
            <article className="empty-card">
              <h3>Заявок не найдено</h3>
              <p>По текущему фильтру записи отсутствуют.</p>
            </article>
          ) : (
            paginatedReservations.map((item) => {
              const reservationId = item.id
              const nextStatuses = getNextStatuses(item.status)
              const selectedDraft = draftStatuses[reservationId] || ''

              return (
                <article className="admin-card" key={reservationId}>
                  <div className="reservation-card-top">
                    <div>
                      <p className="card-eyebrow">{item.venueType}</p>
                      <h3>{item.venueName}</h3>
                    </div>
                    <span className={getStatusClass(item.status)}>{item.status}</span>
                  </div>

                  <div className="reservation-info-grid">
                    <p><strong>Клиент:</strong> {item.userId?.fullName || item.userFullName || item.userLogin}</p>
                    <p><strong>Телефон:</strong> {item.userId?.phoneNumber || item.userPhoneNumber}</p>
                    <p><strong>Email:</strong> {item.userId?.email || item.userEmail}</p>
                    <p><strong>Дата банкета:</strong> {formatDateRu(item.eventDate)}</p>
                    <p><strong>Способ оплаты:</strong> {item.paymentMethod}</p>
                  </div>

                  <div className="status-actions">
                    <label className="field">
                      <span>Новый статус</span>
                      <select
                        value={selectedDraft}
                        onChange={(e) => handleDraftStatusChange(reservationId, e.target.value)}
                      >
                        <option value="">
                          {nextStatuses.length === 0 ? "Переходов нет" : "Выберите статус"}
                        </option>
                        {nextStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="submit"
                      className="btn"
                      onClick={() => saveStatus(reservationId, item.status)}
                      disabled={nextStatuses.length === 0 || !selectedDraft || selectedDraft === item.status}
                    >
                      Сохранить статус
                    </button>
                  </div>
                </article>
              )
            })
          )}
        </section>

        {totalPages > 1 ? (
          <section className="pagination" aria-label="Пагинация">
            <button
              type="button"
              className="btn"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safeCurrentPage === 1}
            >
              Назад
            </button>

            <p>{safeCurrentPage} / {totalPages}</p>

            <button
              type="button"
              className="btn"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safeCurrentPage === totalPages}
            >
              Вперёд
            </button>
          </section>
        ) : null}
      </main>
    </Layout>
  )
}