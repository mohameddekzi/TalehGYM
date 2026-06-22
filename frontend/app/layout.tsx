import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "Taleh GYM — Fitness & Wellness Management System",
    template: "%s · Taleh GYM",
  },
  description:
    "Taleh GYM is a premium multi-branch fitness club and a complete management platform for members, coaches, and operators.",
  keywords: [
    "Taleh GYM",
    "gym management",
    "fitness",
    "membership",
    "personal training",
    "Somalia gym",
  ],
  openGraph: {
    title: "Taleh GYM — Fitness & Wellness Management System",
    description:
      "Train hard. Track everything. A premium gym experience powered by a complete management platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sora.variable}`}
    >
      <head>
        <script
          // Apply the saved (or default dark) theme before paint to avoid a flash.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'){document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
