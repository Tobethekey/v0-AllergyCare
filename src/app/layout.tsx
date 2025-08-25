import type React from "react"
import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"
import { Funnel_Display as FontDisplay } from "next/font/google"
import { cn } from "@/lib/utils"
import { NavItems } from "@/components/navigation/NavItems"
import { Toaster } from "@/components/ui/toaster"
import { AppLogo } from "@/components/AppLogo"
import { MobileNav } from "@/components/navigation/MobileNav"
import "./globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontDisplay = FontDisplay({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})

export const metadata: Metadata = {
  title: "AllergyCare - Dein Allergie-Tagebuch",
  description: "Verfolge deine Mahlzeiten und Symptome, um Allergie-Auslöser zu finden.",
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontDisplay.variable)}>
        <div className="flex h-screen overflow-hidden">
          {/* Feste Desktop-Sidebar */}
          <aside className="hidden w-64 flex-col md:flex md:flex-shrink-0">
            <div className="flex h-16 flex-shrink-0 items-center border-b bg-background px-4">
              <AppLogo />
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavItems />
            </div>
          </aside>

          {/* Hauptinhalt-Bereich */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            {/* Mobile Navigation (nur der Button ist anfangs sichtbar) */}
            <MobileNav>
              <NavItems />
            </MobileNav>

            <main className="flex-1 p-4 pt-12 md:p-8 md:pt-8">{children}</main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
