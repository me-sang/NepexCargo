import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nepex Cargo — Move anything, anywhere it matters",
  description:
    "Fast, reliable, and transparent logistics solutions. International, domestic, and local shipping with real-time tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
