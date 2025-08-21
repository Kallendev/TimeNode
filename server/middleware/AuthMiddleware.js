import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ Cookie-based auth (your original)
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

// ✅ Role check for ADMIN only
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

// ✅ "protect" — works with both cookie OR Bearer token
export const protect = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // fetch user from DB so you always have up-to-date role, etc.
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch (err) {
    console.error('[PROTECT ERROR]', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
