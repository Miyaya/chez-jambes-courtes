import type { Metadata } from "next";
import { Chiron_GoRound_TC, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./_components/Nav";
import CartPanel from "./_components/CartPanel";
import { CartProvider } from "./_components/CartProvider";
import PurchaseBanner from "./_components/PurchaseBanner";

const chironGoRoundTC = Chiron_GoRound_TC({
  variable: "--font-chiron",
  subsets: ["latin"],
  weight: "variable",
  adjustFontFallback: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chez Jambes Courtes",
  description: "巴黎也買得到台灣ㄉ鮮果！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${chironGoRoundTC.variable} ${geistMono.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <div className="sticky top-0 z-50">
            <Nav />
            <PurchaseBanner />
          </div>
          <CartPanel />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
