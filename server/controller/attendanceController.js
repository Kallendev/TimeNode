import { PrismaClient } from '@prisma/client';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import nodemailer from 'nodemailer';
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import getStream from "get-stream";

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
    const { userId, from, to, page = 1, limit = 20, weekOffset } = req.query;

    const where = {};
    if (userId) where.userId = Number(userId);
    if (from || to) {
      where.day = {};
      if (from) where.day.gte = startOfDay(new Date(from));
      if (to) where.day.lte = endOfDay(new Date(to));
    } else if (weekOffset !== undefined) {
      const offset = Number(weekOffset || 0);
      const base = new Date();
      const ws = startOfWeek(addDays(base, offset * 7), { weekStartsOn: 1 });
      const we = endOfWeek(addDays(base, offset * 7), { weekStartsOn: 1 });
      where.day = { gte: ws, lte: we };
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
  const hdr = ["User ID", "Name", "Email", "Day", "Check In", "Check Out"];
  const lines = rows.map((r) =>
    [
      r.user.id,
      `"${r.user.name}"`,
      r.user.email,
      format(r.day, "yyyy-MM-dd"),
      r.checkIn ? format(r.checkIn, "yyyy-MM-dd HH:mm:ss") : "",
      r.checkOut ? format(r.checkOut, "yyyy-MM-dd HH:mm:ss") : "",
    ].join(",")
  );
  return [hdr.join(","), ...lines].join("\n");
};

/** ADMIN: Weekly Report (CSV or PDF) */
export const adminWeeklyReport = async (req, res) => {
  try {
    const offset = Number(req.query.weekOffset || 0);
    const base = new Date();
    const start = startOfWeek(addDays(base, offset * 7), { weekStartsOn: 1 }); // Monday
    let end = endOfWeek(addDays(base, offset * 7), { weekStartsOn: 1 }); // Sunday
    // If current week (offset=0), cap end to today
    if (offset === 0) {
      const today = new Date();
      if (today < end) end = today;
    }

    const records = await prisma.attendance.findMany({
      where: { day: { gte: start, lte: end } },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: [{ userId: "asc" }, { day: "asc" }],
    });

    // default format = csv
    const formatType = req.query.format || "csv";
    let fileBuffer, fileName, mimeType;

    if (formatType === "csv") {
      const csv = toCsv(records);
      fileBuffer = Buffer.from(csv, "utf-8");
      fileName = "attendance-week.csv";
      mimeType = "text/csv";
    }

    if (formatType === "pdf") {
      // Preload all employees for absent calculations
      const allEmployees = await prisma.user.findMany({
        where: { role: 'EMPLOYEE' },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      });

      const margin = 30;
      const doc = new PDFDocument({ margin, size: "A4" });

      // Set headers before piping
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="attendance-week.pdf"`
      );

      // Stream PDF directly to response
      doc.pipe(res);

      // Title
      doc.fontSize(18).text("Weekly Attendance Report", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(
          `Period: ${format(start, "yyyy-MM-dd")} — ${format(end, "yyyy-MM-dd")}`,
          { align: "center" }
        );
      doc.moveDown(1.5);

      // Layout helpers
      const startX = margin;
      const usableWidth = doc.page.width - margin * 2;
      const colWidths = { name: 180, email: 260 };
      const rowHeight = 18;

      const ensureSpace = (lines = 1) => {
        const bottom = doc.page.height - margin - rowHeight * lines;
        if (doc.y > bottom) {
          doc.addPage();
        }
      };

      const drawList = (title, items) => {
        ensureSpace(2);
        doc.font("Helvetica-Bold").text(title, startX, doc.y);
        doc.font("Helvetica");
        if (!items.length) {
          doc.text("—", startX + 10, doc.y);
          doc.moveDown();
          return;
        }
        items.forEach((u) => {
          ensureSpace();
          let x = startX + 10;
          const y = doc.y;
          doc.text(u.name || "—", x, y, { width: colWidths.name, ellipsis: true });
          x += colWidths.name + 10;
          doc.text(u.email || "—", x, y, { width: colWidths.email, ellipsis: true });
          doc.moveDown();
        });
      };

      // Build weekday sections
      for (let i = 0; ; i++) {
        const day = addDays(start, i);
        if (day > end) break;
        const dayTitle = format(day, "EEEE, yyyy-MM-dd");

        const dayRecords = records.filter((r) => isSameDay(r.day, day));
        const presentIds = new Set(dayRecords.filter((r) => r.checkIn).map((r) => r.userId));
        const present = allEmployees.filter((u) => presentIds.has(u.id));
        const absent = allEmployees.filter((u) => !presentIds.has(u.id));

        ensureSpace(3);
        doc.moveDown(0.5);
        doc.fontSize(13).font("Helvetica-Bold").text(dayTitle, { continued: false });
        doc.fontSize(11).font("Helvetica");
        doc.text(`Present: ${present.length}    Absent: ${absent.length}`);
        doc.moveDown(0.5);

        drawList("Present", present);
        drawList("Absent", absent);

        // Add divider line between days except last
        if (i < 6) {
          ensureSpace();
          const y = doc.y + 5;
          doc.moveTo(margin, y).lineTo(doc.page.width - margin, y).stroke();
          doc.moveDown();
        }
      }

      doc.end();
      return; // We've already sent the response
    }

    // Send file to client (CSV or other buffered formats)
    res.setHeader("Content-Type", mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );
    res.send(fileBuffer);
  } catch (err) {
    console.error("[WEEKLY REPORT ERROR]", err);
    res.status(500).json({ error: "Failed to generate weekly report" });
  }
};

/** ADMIN: Today's insights - counts and lists */
export const adminTodayInsights = async (req, res) => {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // All active employees (assuming all users except ADMIN are active employees)
    const allEmployees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { name: 'asc' },
    });

    const totalEmployees = allEmployees.length;

    // New joiners today (not week-based)
    const newEmployeesToday = allEmployees.filter(
      (u) => u.createdAt >= todayStart && u.createdAt <= todayEnd
    );

    // Attendance for today only
    const todayAttendance = await prisma.attendance.findMany({
      where: { day: { gte: todayStart, lte: todayEnd } },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const presentEmployeeIds = new Set(todayAttendance.filter((a) => a.checkIn).map((a) => a.userId));

    const presentEmployees = allEmployees.filter((u) => presentEmployeeIds.has(u.id));
    const absentEmployees = allEmployees.filter((u) => !presentEmployeeIds.has(u.id));

    // Late check-ins (after 09:00) — based on today only
    const lateThreshold = new Date(todayStart);
    lateThreshold.setHours(9, 0, 0, 0);
    const late = todayAttendance
      .filter((a) => a.checkIn && a.checkIn > lateThreshold)
      .map((a) => ({
        id: a.user.id,
        name: a.user.name,
        email: a.user.email,
        checkIn: a.checkIn,
      }));

    res.json({
      summary: {
        totalEmployees,
        present: presentEmployees.length,
        absent: absentEmployees.length,
        newJoinersToday: newEmployeesToday.length,
        range: { start: todayStart, end: todayEnd },
      },
      newEmployeesToday,
      presentEmployees,
      absentEmployees,
      lateCheckIns: late,
    });
  } catch (err) {
    console.error('[ADMIN TODAY INSIGHTS ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch today insights' });
  }
};