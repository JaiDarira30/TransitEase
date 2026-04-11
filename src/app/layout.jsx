import "./globals.css";
import { Inter } from "next/font/google";

// Professional font setup
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TransitEase | Comfort Before You Commute",
  description: "AI-powered real-time crowd prediction and comfort analytics for public transport.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body 
        className={`${inter.className} bg-black text-white antialiased min-h-screen relative`}
        suppressHydrationWarning
      >
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}