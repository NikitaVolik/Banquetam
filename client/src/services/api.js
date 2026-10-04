// client/src/services/api.js

export async function apiFetch(path, options = {}, token = '') {
    const headers = {
        ...(options.body ? {'Content-Type': 'application/json'}: {}),
        ...(options.headers || {})
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(path, {
        ...options,
        headers
    })

    const contentType = response.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await response.json() : null

    if (!response.ok) {
        if (data && Array.isArray(data.errors) && data.errors.length > 0) {
            throw new Error(data.errors.map((item) => item.msg).join('\n'))
        }

        throw new Error((data && data.message) || 'Ошибка запроса')
    }

    return data
}