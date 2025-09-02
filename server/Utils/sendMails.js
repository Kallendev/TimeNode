import nodemailer from 'nodemailer';

export const sendOTP = async (to, otp) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or another provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password for Gmail
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"TimeNode Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Your OTP for Password Reset',
      html: `<p>Your OTP is: <b>${otp}</b>. It expires in 10 minutes.</p>`,
    });

    console.log('✅ OTP email sent successfully');
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
  }
};
export const sendWeeklyReport = async (csvBuffer, pdfBuffer, start, end) => {
  try {
    // Create transporter (same Gmail setup as OTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    // Send email with CSV + PDF attachments
    await transporter.sendMail({
      from: `"TimeNode Reports" <${process.env.EMAIL_USER}>`,
      to: process.env.HR_EMAIL, // HR email in your .env
      subject: `Weekly Attendance Report (${start} — ${end})`,
      text: "Please find attached the weekly attendance report in both CSV and PDF formats.",
      attachments: [
        {
          filename: "attendance-week.csv",
          content: csvBuffer,
        },
        {
          filename: "attendance-week.pdf",
          content: pdfBuffer,
        },
      ],
    });

    console.log("✅ Weekly report email sent successfully");
  } catch (error) {
    console.error("❌ Failed to send weekly report email:", error);
  }
};