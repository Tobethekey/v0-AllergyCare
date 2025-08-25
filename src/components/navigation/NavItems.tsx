"use client" // Wichtig: 'use client' hinzufügen, da wir einen Hook (usePathname) verwenden

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { getPremiumStatus, getRemainingUsage } from "@/lib/data-service"
import { PremiumBadge } from "@/components/premium/PremiumBadge"
import {
  LayoutDashboard,
  ClipboardList,
  Stethoscope,
  BarChart3,
  GitCompareArrows,
  Users,
  Settings,
  HelpCircle,
  Crown,
} from "lucide-react"

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/food-log", label: "Essens-Log", icon: ClipboardList },
  { href: "/symptom-log", label: "Symptom-Log", icon: Stethoscope },
  { href: "/timeline", label: "Zeitstrahl & Analyse", icon: GitCompareArrows },
  { href: "/reports", label: "Berichte", icon: BarChart3 },
  { href: "/profiles", label: "Profile", icon: Users },
  { href: "/premium", label: "Premium", icon: Crown },
  { href: "/settings", label: "Einstellungen", icon: Settings },
  { href: "/help", label: "Hilfe", icon: HelpCircle },
]

export function NavItems() {
  const pathname = usePathname()
  const premiumStatus = getPremiumStatus()
  const remainingUsage = getRemainingUsage()

  return (
    <nav className="flex flex-col gap-1 p-2">
      {premiumStatus.isPremium && (
        <div className="px-3 py-2 mb-2">
          <PremiumBadge />
        </div>
      )}

      {!premiumStatus.isPremium && (
        <div className="px-3 py-2 mb-2 text-xs text-muted-foreground">
          <div>Heute noch verfügbar:</div>
          <div>• {remainingUsage.foodEntries} Mahlzeit(en)</div>
          <div>• {remainingUsage.symptomEntries} Symptom(e)</div>
          <div>• {remainingUsage.exports} Export(s)</div>
        </div>
      )}

      {navLinks.map((link) => {
        const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
        const isPremiumLink = link.href === "/premium"

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isPremiumLink &&
                !premiumStatus.isPremium &&
                "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200",
            )}
          >
            <link.icon className={cn("h-4 w-4", isPremiumLink && !premiumStatus.isPremium && "text-yellow-600")} />
            {link.label}
            {isPremiumLink && !premiumStatus.isPremium && (
              <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Upgrade</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
