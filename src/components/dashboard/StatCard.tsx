import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  accentColor?: "rose" | "emerald" | "amber" | "blue" | "indigo" | "purple";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp,
  accentColor = "rose",
}: StatCardProps) {
  const accentStyles = {
    rose: "bg-rose-50 text-rose-600 border-rose-200/90 shadow-3d-sm",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200/90 shadow-3d-sm",
    amber: "bg-amber-50 text-amber-600 border-amber-200/90 shadow-3d-sm",
    blue: "bg-blue-50 text-blue-600 border-blue-200/90 shadow-3d-sm",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200/90 shadow-3d-sm",
    purple: "bg-purple-50 text-purple-600 border-purple-200/90 shadow-3d-sm",
  };

  return (
    <Card className="relative overflow-hidden group hover:-translate-y-1 hover:shadow-3d-lg transition-all duration-300">
      <CardContent className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          {trend && (
            <span
              className={cn(
                "inline-block text-xs font-bold mt-1 px-2 py-0.5 rounded-full border shadow-3d-sm",
                trendUp ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"
              )}
            >
              {trend}
            </span>
          )}
        </div>
        <div className={cn("p-3 rounded-2xl border shrink-0 transition-transform duration-300 group-hover:scale-110", accentStyles[accentColor])}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
