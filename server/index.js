import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import AuthRoutes from './routes/AuthRoutes.js';
import Password from './routes/PasswordResetRoute.js';
import AttendanceRoutes from './routes/AttendanceRoutes.js';
import cron from "node-cron";
import { adminWeeklyReport } from "./controller/attendanceController.js";
import taskRoutes from "./routes/taskRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

//import listEndpoints from 'express-list-endpoints';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// CORS configuration to allow cookies
app.use(cors({
  origin: 'http://localhost:5174', // Your frontend URL
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser()); // Enable cookie parsing

const PORT = process.env.PORT || 8000;

app.get('/', async (req, res) => { 
  res.send('Backend server is running!');
});

//Auth Routes
app.use('/api/auth', AuthRoutes);

//Password Reset Routes
app.use('/api/password-reset', Password);
//Attendance Routes

app.use('/api/attendance', AttendanceRoutes);

// Every Sunday at 00:00
cron.schedule("0 0 * * 0", async () => {
  console.log("⏰ Running scheduled weekly report...");
  try {
    await adminWeeklyReport(null, null, true); // autoEmail mode
    console.log("✅ Weekly report emailed successfully");
  } catch (err) {
    console.error("❌ Failed to send weekly report:", err);
  }
});
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on PORT:${PORT}`);
});


