import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "拾光通讯录",
  description: "一个简洁、可靠的在线通讯录",
  openGraph: {
    title: "拾光通讯录",
    description: "一个简洁、可靠的在线通讯录",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
