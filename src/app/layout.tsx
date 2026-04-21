import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IPT One Telecoms | Reseller Portal",
  description: "IPT One Telecoms South Africa - Reseller Management Portal for Fibre, VOIP, Cloud, and Hardware Services",
  keywords: "IPT One, Telecoms, Reseller, Fibre, VOIP, South Africa",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
