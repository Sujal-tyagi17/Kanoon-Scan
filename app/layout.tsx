import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "KanoonScan - Know Before You Sign",
  description: "AI-powered legal document analysis. Extract critical clauses, identify risks, and synthesize summaries with Bloomberg-level precision.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/favicon.png",
      },
    ],
  },
  openGraph: {
    title: "KanoonScan - Know Before You Sign",
    description: "AI-powered legal document analysis.",
    images: [
      {
        url: "/favicon.png",
        width: 192,
        height: 192,
        alt: "KanoonScan Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "KanoonScan - Know Before You Sign",
    description: "AI-powered legal document analysis.",
    images: ["/favicon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#ffc880",
          colorBackground: "#110e02",
          colorText: "#eae2c8",
          colorTextSecondary: "#d7c3ae",
          colorInputBackground: "#1f1c0b",
          colorInputText: "#eae2c8",
        },
        elements: {
          card: "border border-outline-variant/30 shadow-2xl bg-surface-container",
          headerTitle: "text-on-surface font-display-lg font-bold",
          headerSubtitle: "text-on-surface-variant font-body-sm",
          socialButtonsBlockButton: "border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors",
          formButtonPrimary: "bg-gradient-to-r from-primary-container to-primary text-[#452b00] hover:opacity-90 font-bold",
          footerActionText: "text-on-surface-variant",
          footerActionLink: "text-primary hover:text-secondary font-semibold",
          dividerText: "text-on-surface-variant/40",
          dividerLine: "bg-outline-variant/20",
        }
      }}
    >
      <html lang="en" className={`dark ${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}>
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className={`${inter.className} antialiased bg-background text-on-surface`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
