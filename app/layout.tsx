import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Header from "./components/Header";
import AppIconPrompt from "./components/AppIconPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eddy Electronics - ร้านค้าออนไลน์",
  description: "ร้านค้าออนไลน์คุณภาพ สินค้าหลากหลาย ราคาดี จัดส่งรวดเร็ว",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <CartProvider>
          <Header />
          <AppIconPrompt />
          <main className="flex-1">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
