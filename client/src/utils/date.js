// client/src/utils/date.js

export function isValidDateRu(value) {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
        return false
    }

    const [day, month, year] = value.split('.').map(Number)
    const date = new Date(year, month - 1, day)

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    )
}

export const normalizeDateInput = (value) => {
    const digits = String(value).replace(/\D/g, '').slice(0, 8)

    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
}

export function ruDateToSqlDate(value) {
    if (!isValidDateRu(value)) {
        return ''
    }

    const [day, month, year] = value.split('.');
    return `${year}-${month}-${day}`
};

export function formatDateRu(value) {
    if (!value) {
        return ''
    }

    if (typeof value === 'string' && /^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
        return value
    }

    if (typeof value === 'string' && /^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
        const [year, month, day] = value.split('-')
        return `${day}.${month}.${year}`
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return ''
    }

    return date.toLocaleDateString('ru-RU')
}