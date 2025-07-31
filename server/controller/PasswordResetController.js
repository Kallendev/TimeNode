import { PrismaClient } from '@prisma/client';
import { sendOTP } from '../Utils/sendMails.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient(); // Create Prisma instance

export const requestReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
   if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit numeric
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.passwordReset.create({
      data: { email, otp, expiresAt }
    });

    await sendOTP(email, otp);

    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('[OTP ERROR]', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const record = await prisma.passwordReset.findFirst({
      where: {
        email,
        otp,
        used: false,
        expiresAt: { gte: new Date() }
      }
    });

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    await prisma.passwordReset.update({
      where: { id: record.id },
      data: { used: true }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('[RESET ERROR]', err);
    res.status(500).json({ error: 'Could not reset password' });
  }
};