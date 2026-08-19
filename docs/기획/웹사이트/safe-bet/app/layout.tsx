import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "청년 주거지원 실부담 계산기",
  description: "계약 조건을 입력하면 청년 주거지원 정책을 판정하고 최종 예상 주거비를 계산합니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-ink-900">{children}</body>
    </html>
  );
}
