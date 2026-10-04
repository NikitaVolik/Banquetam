// client/src/pages/LoginPage.jsx

import "../styles/auth.css"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Layout from "../components/layout/Layout.jsx"
import authService from "../services/authService.js"
import { useAuth } from "../context/AuthContext.jsx"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    login: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))

    setError('')
    setMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    const payload = {
      login: form.login.trim(),
      password: form.password
    }

    if (!payload.login || !payload.password) {
      setError('Заполните логин и пароль')
      return
    }

    try {
      setIsSubmitting(true)

      const data = await authService.login(payload)

      login({ token: data.token, user: data.user })
      setMessage(data.message || 'Вход выполнен успешно')

      if (data.user?.role === 'admin') {
        navigate('/admin')
        return
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <main className="container" tabIndex="-1">
        <section className="hero" aria-labelledby="loginTitle">
          <h1 id="loginTitle">Логин</h1>
          <p>Авторизуйтесь, чтобы просматривать заявки и работать с личным кабинетом.</p>
        </section>

        <section className="form-card" aria-label="Форма входа">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="login">
                <span>Логин</span>
              </label>
              <input
                id="login"
                name="login"
                type="text"
                autoComplete="username"
                value={form.login}
                onChange={handleChange}
                placeholder="Введите логин"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">
                <span>Пароль</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                required
              />
            </div>

            {error ? <p className="form-error">{error}</p> : null}
            {message ? <p className="form-message">{message}</p> : null}

            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? "Выполняется вход..." : "Вход"}
            </button>

            <p className="form-note">
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </p>
          </form>
        </section>
      </main>
    </Layout>
  )
}