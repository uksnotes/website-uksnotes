import type { Metadata } from "next";
import { Geist, Geist_Mono, Jua } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jua = Jua({
  variable: "--font-jua",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "LunchChat.",
  description: "Find your lunch mate with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jua.variable} antialiased`}
        style={{ fontFamily: 'var(--font-jua), sans-serif' }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
