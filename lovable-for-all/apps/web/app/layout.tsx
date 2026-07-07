import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hatchery Studio",
  description: "Build apps with your own AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
