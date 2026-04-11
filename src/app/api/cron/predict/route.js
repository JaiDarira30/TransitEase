import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const AIRPORT_DATA = {
  "chennai": { lat: 13.0827, lon: 80.2707, code: "MAA", name: "Chennai" },
  "hyderabad": { lat: 17.3850, lon: 78.4867, code: "HYD", name: "Hyderabad" },
  "bangalore": { lat: 12.9716, lon: 77.5946, code: "BLR", name: "Bangalore" },
  "mumbai": { lat: 19.0760, lon: 72.8777, code: "BOM", name: "Mumbai" },
  "delhi": { lat: 28.7041, lon: 77.1025, code: "DEL", name: "Delhi" }
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedCity = searchParams.get('city')?.toLowerCase() || 'chennai';
    const targetEmail = searchParams.get('email'); // Get the email from the frontend

    const targetHub = AIRPORT_DATA[requestedCity];
    if (!targetHub) return NextResponse.json({ error: `Hub not supported` }, { status: 400 });
    if (!targetEmail) return NextResponse.json({ error: `No email provided` }, { status: 400 });

    // 1. Fetch Live Weather Telemetry
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${targetHub.lat}&longitude=${targetHub.lon}&current_weather=true`);
    const weatherData = await weatherResponse.json();
    
    const conditionCode = weatherData.current_weather.weathercode;
    const windSpeed = weatherData.current_weather.windspeed;

    // 2. AI Delay Probability Logic
    let probabilityOfDelay = 0.10; 
    if (conditionCode > 60) probabilityOfDelay += 0.40; 
    if (windSpeed > 40) probabilityOfDelay += 0.35; 

    // 3. NODEMAILER SETUP (UPGRADED FOR NETWORK STABILITY)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Forces SSL encryption to bypass firewalls
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD 
      }
    });

    // 4. SEND THE REAL EMAIL
    if (probabilityOfDelay > 0.00) {
      await transporter.sendMail({
        from: `"TransitEase AI" <${process.env.EMAIL_USER}>`,
        to: targetEmail,
        subject: `⚠️ AI Alert: High Risk of Delay at ${targetHub.code}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
            <h2 style="color: #ef4444;">TransitEase Pre-emptive Alert</h2>
            <p>Our AI telemetry nodes have detected severe weather patterns currently developing over <strong>${targetHub.name} (${targetHub.code})</strong>.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Live Wind Speed:</strong> ${windSpeed} km/h</p>
              <p style="margin: 0;"><strong>Calculated Delay Risk:</strong> ${Math.round(probabilityOfDelay * 100)}%</p>
            </div>
            <p>We highly recommend reviewing your connecting transit options.</p>
            <p style="color: #6b7280; font-size: 12px;">Generated autonomously by SAARTHI Core v3.1</p>
          </div>
        `
      });

      return NextResponse.json({ status: "Alert Triggered", message: "Email sent successfully." });
    }

    // If weather is fine, we can optionally send an "All Clear" email, or just do nothing.
    return NextResponse.json({ status: "Clear Skies", message: "No email needed." });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Backend failure" }, { status: 500 });
  }
}