"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getFoodEntries,
  getSymptomEntries,
  getUserProfiles,
  getPremiumStatus,
  getRemainingUsage,
} from "@/lib/data-service"
import { UsageLimitWarning } from "@/components/premium/UsageLimitWarning"
import { Apple, HeartPulse, Users, TrendingUp, Crown, AlertTriangle } from "lucide-react"

interface Stats {
  totalMeals: number
  totalSymptoms: number
  totalProfiles: number
  recentActivity: number
}

export function QuickStats() {
  const [stats, setStats] = useState<Stats>({
    totalMeals: 0,
    totalSymptoms: 0,
    totalProfiles: 0,
    recentActivity: 0,
  })

  const premiumStatus = getPremiumStatus()
  const remainingUsage = getRemainingUsage()

  useEffect(() => {
    const foodEntries = getFoodEntries()
    const symptomEntries = getSymptomEntries()
    const profiles = getUserProfiles()

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentMeals = foodEntries.filter((entry) => new Date(entry.timestamp) >= sevenDaysAgo).length

    const recentSymptoms = symptomEntries.filter((entry) => new Date(entry.startTime) >= sevenDaysAgo).length

    setStats({
      totalMeals: foodEntries.length,
      totalSymptoms: symptomEntries.length,
      totalProfiles: profiles.length,
      recentActivity: recentMeals + recentSymptoms,
    })
  }, [])

  const statCards = [
    {
      title: "Mahlzeiten",
      value: stats.totalMeals,
      icon: Apple,
      color: "text-green-600",
      remaining: remainingUsage.foodEntries,
      type: "foodEntries" as const,
    },
    {
      title: "Symptome",
      value: stats.totalSymptoms,
      icon: HeartPulse,
      color: "text-red-600",
      remaining: remainingUsage.symptomEntries,
      type: "symptomEntries" as const,
    },
    {
      title: "Profile",
      value: stats.totalProfiles,
      icon: Users,
      color: "text-blue-600",
      remaining: remainingUsage.profiles,
      type: "profiles" as const,
    },
    {
      title: "Letzte 7 Tage",
      value: stats.recentActivity,
      icon: TrendingUp,
      color: "text-purple-600",
      remaining: "unlimited",
      type: null,
    },
  ]

  return (
    <div className="space-y-6">
      {premiumStatus.isPremium && (
        <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Premium Aktiv</span>
              <span className="text-sm text-yellow-700">- Unbegrenzte Nutzung aller Features</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const isLimitReached = !premiumStatus.isPremium && stat.remaining === 0
          const hasWarning = !premiumStatus.isPremium && typeof stat.remaining === "number" && stat.remaining <= 1

          return (
            <Card
              key={stat.title}
              className={cn(
                "shadow-md hover:shadow-lg transition-shadow",
                isLimitReached && "border-red-200 bg-red-50",
                hasWarning && !isLimitReached && "border-yellow-200 bg-yellow-50",
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className="flex items-center gap-1">
                  {isLimitReached && <AlertTriangle className="h-3 w-3 text-red-500" />}
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {!premiumStatus.isPremium && stat.type && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.remaining === "unlimited" ? (
                      "Unbegrenzt"
                    ) : (
                      <span className={isLimitReached ? "text-red-600 font-medium" : ""}>
                        Noch {stat.remaining} heute
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!premiumStatus.isPremium && (
        <div className="space-y-4">
          {remainingUsage.foodEntries === 0 && (
            <UsageLimitWarning type="foodEntries" remaining={remainingUsage.foodEntries} />
          )}
          {remainingUsage.symptomEntries === 0 && (
            <UsageLimitWarning type="symptomEntries" remaining={remainingUsage.symptomEntries} />
          )}
          {remainingUsage.exports === 0 && <UsageLimitWarning type="exports" remaining={remainingUsage.exports} />}
          {remainingUsage.profiles === 0 && <UsageLimitWarning type="profiles" remaining={remainingUsage.profiles} />}
        </div>
      )}
    </div>
  )
}
