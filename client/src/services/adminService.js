// client/src/services/adminService.js

import { apiFetch } from "./api.js"

const adminService = {
    getReservations(status = '', token) {
        const query = status ? `?status=${encodeURIComponent(status)}` : ''
        return apiFetch(`/api/admin/reservations${query}`, { method: 'GET' }, token)
    },

    updateStatus(id, status, token) {
        return apiFetch(
            `/api/admin/reservations/${id}/status`,
            {
                method: 'PUT',
                body: JSON.stringify({ status })
            },
            token
        )
    }
}

export default adminService