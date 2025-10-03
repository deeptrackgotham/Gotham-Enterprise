import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/ui/header";
import { ThemeProvider } from "@/components/theme-provider";
import Footer from "@/components/ui/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Deeptrack Gotham",
  description: "Deepfake Verification made easy.",
  icons: {
    icon: "logo-light.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.className} min-h-screen bg-background text-slate-900 dark:text-slate-100`}
        >
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <div className="flex flex-col min-h-screen">
              {/* Header */}
              <Header />

              {/* Main content */}
              <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
              </div>

              {/* Footer */}
              <Footer />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
