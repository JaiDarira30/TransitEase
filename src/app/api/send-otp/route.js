import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    // Log for debugging
    console.log("Attempting to send OTP to:", email);

    // FIX 1: Updated to match your .env variable name (EMAIL_APP_PASSWORD)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.error("Missing EMAIL_USER or EMAIL_APP_PASSWORD in .env.local");
      return NextResponse.json({ success: false, error: "Server config error" }, { status: 500 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // FIX 2: Upgraded transporter to force SSL and bypass the 30-second network timeout
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Updated to match
      },
    });

    // Test the connection before sending
    await transporter.verify();

    await transporter.sendMail({
      from: `"TransitEase Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verification Code: " + otp,
      html: `
        <div style="background:#000; color:#fff; padding:30px; border-radius:20px; text-align:center; font-family:sans-serif;">
          <h2 style="color:#06b6d4;">TransitEase Authentication</h2>
          <h1 style="font-size:48px; letter-spacing:10px; margin:20px 0; color:#fff;">${otp}</h1>
        </div>`
    });

    console.log("OTP Email sent successfully!");
    return NextResponse.json({ success: true, otp });
    
  } catch (error) {
    // THIS LOG IS CRUCIAL: Check your terminal for this output!
    console.error("NODEMAILER ERROR:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}