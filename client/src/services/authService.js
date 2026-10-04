// client/src/services/authService.js

import { apiFetch } from "./api.js"

const authService = {
    login(payload) {
        return apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    register(payload) {
        return apiFetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    checkLogin(login) {
        const query = encodeURIComponent(String(login || '').trim())
        return apiFetch(`/api/fetch/check-login?login=${query}`, {
            method: 'GET'
        })
    }
}

export default authService