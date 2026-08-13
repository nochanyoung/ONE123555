import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "청년 주거지원 실부담 계산기",
  description: "매물 조건을 입력하면 최대 지원 가능액과 최종 예상 주거비를 계산합니다",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
