import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  return {
    metadataBase: new URL(origin),
    title: "십 묶음 택배 터미널",
    description: "초등 1~2학년이 십 묶음과 낱개로 0부터 100까지의 수를 익히는 교육용 웹앱",
    openGraph: {
      title: "십 묶음 택배 터미널",
      description: "10개를 묶고 풀며 전체 수가 그대로인지 확인해요.",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1731, height: 909, alt: "낱개 10개와 십 묶음 1개가 같은 수임을 보여 주는 십 묶음 택배 터미널" }],
    },
    twitter: { card: "summary_large_image", images: [`${origin}/og.png`] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <noscript>이 학습 앱을 사용하려면 브라우저에서 JavaScript를 켜 주세요.</noscript>
      </body>
    </html>
  );
}
