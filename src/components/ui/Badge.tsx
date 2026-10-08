import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
  children: React.ReactNode;
}

export function Badge({ variant = "default", children, className, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200/90 shadow-3d-sm",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/90 shadow-3d-sm",
    warning: "bg-amber-50 text-amber-700 border-amber-200/90 shadow-3d-sm",
    danger: "bg-rose-50 text-rose-700 border-rose-200/90 shadow-3d-sm",
    info: "bg-sky-50 text-sky-700 border-sky-200/90 shadow-3d-sm",
    outline: "bg-white text-slate-600 border-slate-200 shadow-3d-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all duration-150 select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
