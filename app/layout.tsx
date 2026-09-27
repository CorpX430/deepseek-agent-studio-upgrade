import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "DeepSeek Agent Studio", description: "A focused workspace for DeepSeek chat, coding agents, and character sessions.", generator: "DeepSeek Agent Studio" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, themeColor: "#090b10", colorScheme: "dark" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
