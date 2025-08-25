import { Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PremiumBadgeProps {
  className?: string
}

export function PremiumBadge({ className }: PremiumBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 ${className}`}
    >
      <Crown className="w-3 h-3 mr-1" />
      Premium
    </Badge>
  )
}
