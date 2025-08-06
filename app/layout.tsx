import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { Providers } from "@/components/providers" // Import Providers
import { Toaster } from "sonner" // Import Toaster

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
title: "AnimeVault - Download Portal",
description: "Minimalist anime download portal with direct links",
    generator: 'v0.dev'
}

export default function RootLayout({
children,
}: {
children: React.ReactNode
}) {
return (
  <html lang="en" suppressHydrationWarning>
    <body className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <Providers> {/* Wrap with Providers */}
          <div className="min-h-screen bg-background">
            <Navigation />
            <main>{children}</main>
          </div>
        </Providers>
        <Toaster /> {/* Add Toaster for notifications */}
      </ThemeProvider>
    </body>
  </html>
)
}
