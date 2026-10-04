// client/src/services/venueService.js

import { apiFetch } from "./api.js"

const venueService = {
    getAll(token) {
        return apiFetch('/api/venues', { method: 'GET' }, token )
    },

    getById(token) {
        return apiFetch(`/api/venues/${id}`, { method: 'GET' }, token )
    },
    
    create(payload, token) {
        return apiFetch(
            '/api/venues',
            {
                method: 'POST',
                body: JSON.stringify(payload)
            },
            token
        )
    },

    remove(id, token) {
        return apiFetch(
            `/api/venues/${id}`,
            { method: 'DELETE' },
            token
        )
    }
}

export default venueService