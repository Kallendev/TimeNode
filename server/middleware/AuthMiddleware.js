import jwt from 'jsonwebtoken';

// AuthMiddleware.js

export const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('[AUTH ERROR]', error);
    res.status(401).json({ error: 'Invalid or missing token' });
  }
};

export const requireAdmin = (req, res, next) => {
  try {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
  } catch (error) {
    console.error('[ADMIN CHECK ERROR]', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

