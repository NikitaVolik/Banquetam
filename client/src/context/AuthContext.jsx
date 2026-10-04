// client/src/context/AuthContext.jsx

import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [token, setToken] = useState('')
    const [user, setUser] = useState(null)

    const login = ({ token: nextToken, user: nextUser }) => {
        if (!nextToken || !nextUser) {
            throw new Error('Некорректные данные авторизации')
        }

        setToken(nextToken)
        setUser(nextUser)
    }

    const logout = () => {
        setToken('')
        setUser(null)
    }

    const value = useMemo(
        () => ({
            token,
            user,
            isAuthenticated: Boolean(token && user),
            login,
            logout
        }),
        [token, user]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider')
    }
    
    return context
}