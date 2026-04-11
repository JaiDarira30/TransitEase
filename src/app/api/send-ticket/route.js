import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { passengerDetails, route, startStop, endStop, userEmail } = body;

    // 1. Generate QR Code Data
    const qrData = JSON.stringify({
      route,
      passengers: passengerDetails.length,
      timestamp: new Date().toLocaleString()
    });
    
    // 2. Generate Base64 String and extract the raw data
    const qrImage = await QRCode.toDataURL(qrData);
    const base64Data = qrImage.split("base64,")[1]; // Removes the "data:image/png;base64," prefix

    // 3. Configure NodeMailer
   const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Make sure this matches your .env!
      },
    });

    // 4. Build the Passenger Info String
    const passengerInfo = passengerDetails
      .map(p => `Seat ${p.seat}: ${p.name} (${p.gender})`)
      .join("<br/>");

    // 5. Send Email with Inline Attachment
    await transporter.sendMail({
      from: '"TransitEase VIT" <aiprojectvit23@gmail.com>',
      to: userEmail,
      subject: `Your VIT Shuttle Ticket - Route: ${route}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #00ffcc; border-radius: 20px; background: #0b1220; color: white;">
          <h1 style="color: #00ffcc; font-style: italic; margin-top: 0;">VIT Shuttle Terminal</h1>
          <p style="color: #888">Official E-Ticket Node</p>
          <hr style="border-color: #333" />
          <div style="margin: 20px 0;">
            <p><strong>Route:</strong> ${route}</p>
            <p><strong>Boarding:</strong> ${startStop} → <strong>Destination:</strong> ${endStop}</p>
            <p><strong>Passengers:</strong><br/>${passengerInfo}</p>
          </div>
          <div style="text-align: center; background: white; padding: 15px; border-radius: 10px; width: fit-content; margin: auto;">
            
            <img src="cid:ticketQR" alt="Ticket QR Code" style="width: 150px; height: 150px; display: block; margin: 0 auto;" />
            
            <p style="color: black; font-size: 10px; margin-top: 8px; font-weight: bold; text-transform: uppercase;">Scan at Shuttle Entrance</p>
          </div>
          <p style="font-size: 10px; color: #555; text-align: center; margin-top: 30px;">© 2026 TransitEase Institutional Solutions</p>
        </div>
      `,
      // 🔹 FIX: Attach the QR code and assign it the ID 'ticketQR'
      attachments: [
        {
          filename: 'vit-ticket-qr.png',
          content: base64Data,
          encoding: 'base64',
          cid: 'ticketQR' 
        }
      ]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email Node Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}