// client/src/services/reservationService.js

import { apiFetch } from "./api.js"

const reservationService = {
    getMy(token) {
        return apiFetch('/api/reservations/my', { method: 'GET' }, token )
    },

    create(payload, token) {
        return apiFetch(
            '/api/reservations',
            {
                method: 'POST',
                body: JSON.stringify(payload)
            },
            token
        )
    }
}

export default reservationService