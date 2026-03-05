import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { OfflineIndicator } from "@/components/offline-indicator";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { NotificationProvider } from "@/contexts/notification-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://rantale.randk.me",
  ),
  title: {
    default: "Rantale - Your Book Reading Platform",
    template: "%s | Rantale",
  },
  description:
    "Discover and read amazing books on Rantale. Browse stories across multiple genres, track your reading progress, and share your notebook with fellow students.",
  keywords: [
    "books",
    "reading",
    "notebook",
    "students",
    "stories",
    "fiction",
    "online reading",
    "Rantale",
  ],
  authors: [{ name: "Rantale" }],
  creator: "Rantale",
  publisher: "Rantale",
  applicationName: "Rantale",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Rantale",
    title: "Rantale - Your Book Reading Platform",
    description:
      "Discover and read amazing books on Rantale. Browse stories across multiple genres.",
    images: [
      {
        url: "/rantale-dark.svg",
        width: 1200,
        height: 630,
        alt: "Rantale - Book Reading Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rantale - Your Book Reading Platform",
    description:
      "Discover and read amazing books on Rantale. Browse stories across multiple genres.",
    images: ["/rantale-dark.svg"],
    creator: "@rantale",
  },
  verification: {
    google: "Yapy14cqRJErtoTdJT3GFdXFpKhtiptPZ5VTNzsrITE",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NotificationProvider>{children}</NotificationProvider>
            <Toaster />
            <Analytics />
            {/* <OfflineIndicator /> */}
            {/* <PWAInstallPrompt /> */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
