import nodemailer from 'nodemailer';

export const sendOTP = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or another provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"TimeNest Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP for password reset',
    html: `<p>Your OTP is: <b>${otp}</b>. It expires in 10 minutes.</p>`
  });
};
