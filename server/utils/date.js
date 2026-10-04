// server/utils/date.js

export const isValidDateRu = (value) => {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
        return false;
    }

    const [day, month, year] = value.split('.').map(Number);
    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
};

export const normalizeDateInput = (value) => {
    const digits = String(value).replace(/\D/g, '').slice(0, 8);

    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
};

export const ruDateToSqlDate = (value) => {
    const [day, month, year] = value.split('.');
    return `${year}-${month}-${day}`
};

export const isTodayOrFutureSqlDate = (sqlDate) => {
    const today = new Date();
    const current = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const [year, month, day] = sqlDate.split('-').map(Number);
    const target = new Date(year, month - 1, day);

    return target >= current;
};