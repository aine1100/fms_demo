import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import React from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ElementType | React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
  className?: string
  iconClassName?: string
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  description,
  className,
  iconClassName
}: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {(trend || description) && (
              <div className="flex items-center gap-2">
                {trend && (
                  <span className={cn(
                    "flex items-center text-xs font-medium",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}>
                    {trend.isPositive ? (
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                    ) : trend.value === 0 ? (
                      <Minus className="h-3 w-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                    )}
                    {trend.value > 0 ? '+' : ''}{trend.value}%
                  </span>
                )}
                {description && (
                  <span className="text-xs text-muted-foreground">{description}</span>
                )}
              </div>
            )}
          </div>
        <div className={cn(
            "h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 text-primary",
            iconClassName
          )}>
            {React.isValidElement(icon) ? icon : React.createElement(icon as React.ElementType, { className: "h-6 w-6" })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
