"use client"

import type React from "react"

import { Crown, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PremiumFeatureCardProps {
  title: string
  description: string
  features: string[]
  price?: string
  period?: string
  isPopular?: boolean
  onSelect?: () => void
  customButton?: React.ReactNode
}

export function PremiumFeatureCard({
  title,
  description,
  features,
  price,
  period,
  isPopular,
  onSelect,
  customButton,
}: PremiumFeatureCardProps) {
  return (
    <Card className={`relative ${isPopular ? "border-2 border-yellow-400 shadow-lg" : "border"}`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
          <Crown className="w-3 h-3 mr-1" />
          Beliebt
        </Badge>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {price && (
          <div className="mt-4">
            <div className="text-3xl font-bold text-primary">{price}</div>
            {period && <div className="text-sm text-muted-foreground">{period}</div>}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {customButton ||
          (onSelect && (
            <Button
              onClick={onSelect}
              className={`w-full ${
                isPopular
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
                  : ""
              }`}
              variant={isPopular ? "default" : "outline"}
            >
              {price ? "Auswählen" : "Mehr erfahren"}
            </Button>
          ))}
      </CardContent>
    </Card>
  )
}
