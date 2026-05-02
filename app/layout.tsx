import type { Metadata } from "next";
import { Inter, Orbitron, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import HeaderWallet from "@/components/HeaderWallet";
import HeaderAudioToggle from "@/components/HeaderAudioToggle";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({ subsets: ["latin"], variable: '--font-orbitron' });
const spaceMono = Space_Mono({ 
  weight: ["400", "700"], 
  subsets: ["latin"],
  variable: "--font-space-mono" 
});

export const metadata: Metadata = {
  title: "GenLayer Detective | Official",
  description: "Web3 Investigation Dashboard",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/logo.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
      </head>
      <body className={`${inter.variable} ${orbitron.variable} ${spaceMono.variable} font-sans text-gray-300 min-h-screen antialiased`} style={{ background: 'url("/background.jpg") no-repeat center center fixed', backgroundSize: 'cover' }} suppressHydrationWarning>
        <div className="pt-0">
          <Providers>
            {/* Global Header */}
            <header className="fixed top-0 left-0 w-full z-[100] h-20 flex items-center justify-between px-8 bg-transparent">
              {/* Logo & Branding - Left */}
              <div className="flex items-center gap-6 flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="GenLayer Logo" 
                  className="h-12 w-auto" 
                  style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))', opacity: 1 }} 
                />
                <div className="text-[#d4af37] font-mono text-sm tracking-[0.2em] uppercase drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]">
                  GENLAYER DETECTIVE
                </div>
              </div>

              {/* Case Status - Center */}
              <div className="flex items-center gap-3 px-4 py-1.5 border border-[#d4af37]/30 rounded-full bg-transparent">
                <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse shadow-[0_0_6px_#d4af37]"></div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37]">CASE: ACTIVE</span>
              </div>

              {/* Connection Info - Right */}
              <div className="flex items-center gap-6">
                <HeaderAudioToggle />
                <div className="flex items-center gap-3 px-4 py-1.5 border border-green-500/40 rounded-full bg-transparent">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.8)]"></div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-green-500">GENLAYER TESTNET</span>
                </div>
                <HeaderWallet />
              </div>
            </header>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
