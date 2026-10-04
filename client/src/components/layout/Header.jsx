// client/src/components/layout/Header.jsx

import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext.jsx"

export default function Header() {
    const { user, logout } = useAuth()

    return (
        <header className="site-header">
            <div className="container header-inner">
                <Link to="/" className="logo"aria-label="Banquetam Net – на главную">
                    <span className="logo-main">Banquetam</span>
                    <span className="logo-accent">Net</span>
                </Link>

                <nav className="main-nav" aria-label="Основная навигация">
                    <Link to="/">Главная</Link>
                    {user && <Link to="/reservation">Оформить заявку</Link>}
                    {user && <Link to="/dashboard">Личный кабинет</Link>}
                    {!user && <Link to="/login">Вход</Link>}
                    {!user && <Link to="/register">Регистрация</Link>}
                    {user?.role === "admin" && <Link to="/admin">Админ-панель</Link>}
                    {user && (<button type="button" className="nav-btn" onClick={logout}>Выйти</button>)}
                </nav>
            </div>
        </header>
    )
}