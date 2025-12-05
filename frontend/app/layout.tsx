import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Import Header
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeScript from "./components/ThemeScript";
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web Đọc Truyện",
  description: "Dự án Next.js web đọc truyện",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
          <html lang="vi" suppressHydrationWarning={true}>
      <head>
        {/* 2. ĐẶT SCRIPT VÀO ĐÂY (bên trong head) */}
        <ThemeScript />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}