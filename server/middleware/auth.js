import jwt from 'jsonwebtoken';

/**
 * Middleware: verifies the JWT Bearer token in the Authorization header.
 * On success, attaches the decoded payload to req.user and calls next().
 * On failure, returns 401.
 */
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

/**
 * Middleware factory: returns a middleware that enforces the given role.
 * Must be used AFTER verifyToken (relies on req.user being set).
 * @param {string} role - Required role (e.g. 'admin')
 */
export const requireRole = (role) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (req.user.role !== role) {
        return res.status(403).json({
            message: `Access denied. Requires '${role}' role. Your role: '${req.user.role}'.`
        });
    }
    next();
};
