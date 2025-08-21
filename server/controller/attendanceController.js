import { PrismaClient } from '@prisma/client';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from 'date-fns';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

/** Helper: convert JS Date to midnight (local) for the “day” key */
const dayKey = (d = new Date()) => startOfDay(d);

export const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = dayKey();

    // Upsert the row for today. Fail if already checked in.
    const existing = await prisma.attendance.findUnique({
      where: { userId_day: { userId, day: today } },
    });

    if (existing?.checkIn) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    const record = await prisma.attendance.upsert({
      where: { userId_day: { userId, day: today } },
      update: { checkIn: new Date() },
      create: { userId, day: today, checkIn: new Date() },
    });

    res.json({ message: 'Checked in', record });
  } catch (err) {
    console.error('[CHECKIN ERROR]', err);
    res.status(500).json({ error: 'Failed to check in' });
  }
};

export const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = dayKey();

    const existing = await prisma.attendance.findUnique({
      where: { userId_day: { userId, day: today } },
    });

    if (!existing?.checkIn) {
      return res.status(400).json({ error: 'You have not checked in today' });
    }
    if (existing.checkOut) {
      return res.status(400).json({ error: 'Already checked out today' });
    }

    const record = await prisma.attendance.update({
      where: { userId_day: { userId, day: today } },
      data: { checkOut: new Date() },
    });

    res.json({ message: 'Checked out', record });
  } catch (err) {
    console.error('[CHECKOUT ERROR]', err);
    res.status(500).json({ error: 'Failed to check out' });
  }
};

export const getMyToday = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = dayKey();

    const record = await prisma.attendance.findUnique({
      where: { userId_day: { userId, day: today } },
    });

    res.json({
      day: format(today, 'yyyy-MM-dd'),
      checkIn: record?.checkIn || null,
      checkOut: record?.checkOut || null,
      status: record?.checkIn ? (record?.checkOut ? 'COMPLETED' : 'IN_PROGRESS') : 'NOT_STARTED',
    });
  } catch (err) {
    console.error('[GET TODAY ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch today record' });
  }
};

export const getMyHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (from || to) {
      where.day = {};
      if (from) where.day.gte = startOfDay(new Date(from));
      if (to) where.day.lte = endOfDay(new Date(to));
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        orderBy: { day: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.attendance.count({ where }),
    ]);

    res.json({
      data: items,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (err) {
    console.error('[HISTORY ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

/** ADMIN: list all attendance (filterable) */
export const adminList = async (req, res) => {
  try {
    const { userId, from, to, page = 1, limit = 20 } = req.query;

    const where = {};
    if (userId) where.userId = Number(userId);
    if (from || to) {
      where.day = {};
      if (from) where.day.gte = startOfDay(new Date(from));
      if (to) where.day.lte = endOfDay(new Date(to));
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        orderBy: [{ day: 'desc' }, { userId: 'asc' }],
        include: { user: { select: { id: true, name: true, email: true } } },
        skip,
        take: Number(limit),
      }),
      prisma.attendance.count({ where }),
    ]);

    res.json({ data: items, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (err) {
    console.error('[ADMIN LIST ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

/** ADMIN: generate weekly CSV and (optionally) email */
const toCsv = (rows) => {
  const hdr = ['User ID','Name','Email','Day','Check In','Check Out'];
  const lines = rows.map(r => [
    r.user.id,
    `"${r.user.name}"`,
    r.user.email,
    format(r.day, 'yyyy-MM-dd'),
    r.checkIn ? format(r.checkIn, 'yyyy-MM-dd HH:mm:ss') : '',
    r.checkOut ? format(r.checkOut, 'yyyy-MM-dd HH:mm:ss') : '',
  ].join(','));
  return [hdr.join(','), ...lines].join('\n');
};

export const adminWeeklyReport = async (req, res) => {
  try {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });     // Sunday

    const records = await prisma.attendance.findMany({
      where: { day: { gte: start, lte: end } },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: [{ userId: 'asc' }, { day: 'asc' }],
    });

    const csv = toCsv(records);

    // If you want to email, configure transporter:
    // (Set SMTP creds in .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, HR_EMAIL)
    if (process.env.SMTP_HOST && process.env.HR_EMAIL) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"TimeNode" <${process.env.SMTP_USER}>`,
        to: process.env.HR_EMAIL,
        subject: `Weekly Attendance Report (${format(start, 'yyyy-MM-dd')} — ${format(end, 'yyyy-MM-dd')})`,
        text: 'Attached is the weekly attendance CSV.',
        attachments: [{ filename: 'attendance-week.csv', content: csv }],
      });
    }

    // Also respond with the CSV so admins can download in browser
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance-week.csv"');
    res.send(csv);
  } catch (err) {
    console.error('[WEEKLY REPORT ERROR]', err);
    res.status(500).json({ error: 'Failed to generate weekly report' });
  }
};
