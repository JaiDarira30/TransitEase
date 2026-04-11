import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import QRCode from "qrcode";

export async function POST(req) {
  try {
    const body = await req.json();
    const { licensePlate, vehicleType, timeSlot, fee, paymentStatus, contactInfo, pilgrimNames } = body;

    // 1. Generate the QR Code and extract raw base64 data
    const qrPayload = JSON.stringify({
      plate: licensePlate,
      type: vehicleType,
      slot: timeSlot,
      status: paymentStatus
    });
    const qrImageURI = await QRCode.toDataURL(qrPayload);
    const base64Data = qrImageURI.split(',')[1]; // Strip the HTML prefix for the attachment

    // 2. Configure your Gmail Transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Make sure this matches your .env!
      },
    });

    

    // 3. (Temporarily Disabled) Create the dynamic link
    // const verifyLink = `http://localhost:3000/verify-darshan?plate=${encodeURIComponent(licensePlate)}`;

    // 4. Draft the Email HTML & Attach the Image
    const mailOptions = {
      from: `"Alipiri Toll Node" <aiprojectvit23@gmail.com>`,
      to: contactInfo.email,
      subject: `Alipiri Entry Permit - ${licensePlate}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #f97316; text-align: center;">ALIPIRI CHECKPOINT PERMIT</h2>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <p><strong>Vehicle:</strong> ${licensePlate} (${vehicleType})</p>
          <p><strong>Entry Window:</strong> ${timeSlot}</p>
          <p><strong>Payment Status:</strong> ${paymentStatus} (₹${fee})</p>
          <p><strong>Total Pilgrims:</strong> ${pilgrimNames.length}</p>

          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 2px;">Official QR Code</p>
            <img src="cid:unique-qr-code" alt="Ticket QR Code" style="width: 200px; height: 200px; border: 2px solid #000; border-radius: 10px;" />
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 14px; color: #333; margin-bottom: 15px;"><strong>UPCOMING FEATURE:</strong> TTD Darshan AI Document Verification will be required at this checkpoint soon.</p>
            <div style="background-color: #e5e7eb; color: #9ca3af; padding: 15px 30px; font-weight: 900; border-radius: 8px; display: inline-block; letter-spacing: 1px; cursor: not-allowed;">
              AI VERIFICATION (COMING SOON) 🔒
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'qrcode.png',
          content: base64Data,
          encoding: 'base64',
          cid: 'unique-qr-code' 
        }
      ]
    };

    // 5. Send it!
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: "Ticket dispatched to email." }, { status: 200 });

  } catch (error) {
    console.error("Nodemailer Error:", error);
    return NextResponse.json({ success: false, message: "Failed to send email." }, { status: 500 });
  }
}
