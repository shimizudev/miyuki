import type { Metadata } from "next";
import { Parkinsans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const parkinsans = Parkinsans({
  subsets: ["latin-ext", "latin"],
});

export const metadata: Metadata = {
  title: "Miyuki",
  description: "Watch anime without ads for free!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressContentEditableWarning suppressHydrationWarning>
      <body className={`${parkinsans.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
