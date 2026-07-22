import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const title = "Ozones — Focus Timer";
const description = "A simple Pomodoro focus timer with task tracking.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Ozones",
  keywords: ["pomodoro", "focus timer", "task tracker", "productivity"],
  formatDetection: { telephone: false, address: false, email: false },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    siteName: "Ozones",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#BA4949",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body data-mode="pomodoro" className="min-h-full">
        {children}
      </body>
    </html>
  );
}
