import type { Metadata } from "next";
import { Asap } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const asap = Asap({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
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
      <body className={`${asap.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
