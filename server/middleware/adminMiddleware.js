// server/middleware/adminMiddleware.js

export const adminOnly = (req, res, next) => {
    if (req.user?.role === 'admin') {
        return next();
    }

    return res.status(403).json({ message: 'Доступ только для администратора' });
};