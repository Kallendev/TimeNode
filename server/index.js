import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import AuthRoutes from './routes/AuthRoutes.js';
import Password from './routes/PasswordResetRoute.js';
import AttendanceRoutes from './routes/AttendanceRoutes.js';

//import listEndpoints from 'express-list-endpoints';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// CORS configuration to allow cookies
app.use(cors({
  origin: 'http://localhost:5174', // Your frontend URL
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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




app.listen(PORT, () => {
  console.log(`Server listening on PORT:${PORT}`);
});


