import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { OrderStatus, PaymentStatus, DeliveryStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getOrderStatusBadge(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return { label: "Pending", bg: "bg-amber-50", text: "text-amber-700 font-bold", border: "border-amber-200/90 shadow-3d-sm" };
    case "CONFIRMED":
      return { label: "Confirmed", bg: "bg-blue-50", text: "text-blue-700 font-bold", border: "border-blue-200/90 shadow-3d-sm" };
    case "PREPARING":
      return { label: "Preparing", bg: "bg-indigo-50", text: "text-indigo-700 font-bold", border: "border-indigo-200/90 shadow-3d-sm" };
    case "READY":
      return { label: "Ready", bg: "bg-purple-50", text: "text-purple-700 font-bold", border: "border-purple-200/90 shadow-3d-sm" };
    case "OUT_FOR_DELIVERY":
      return { label: "Out For Delivery", bg: "bg-pink-50", text: "text-pink-700 font-bold", border: "border-pink-200/90 shadow-3d-sm" };
    case "DELIVERED":
      return { label: "Delivered", bg: "bg-emerald-50", text: "text-emerald-700 font-bold", border: "border-emerald-200/90 shadow-3d-sm" };
    case "CANCELLED":
      return { label: "Cancelled", bg: "bg-rose-50", text: "text-rose-700 font-bold", border: "border-rose-200/90 shadow-3d-sm" };
    default:
      return { label: status, bg: "bg-slate-100", text: "text-slate-700 font-semibold", border: "border-slate-200 shadow-3d-sm" };
  }
}

export function getPaymentStatusBadge(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return { label: "Paid", bg: "bg-emerald-50", text: "text-emerald-700 font-bold border-emerald-200 shadow-3d-sm" };
    case "PENDING":
      return { label: "Pending", bg: "bg-amber-50", text: "text-amber-700 font-bold border-amber-200 shadow-3d-sm" };
    case "REFUNDED":
      return { label: "Refunded", bg: "bg-purple-50", text: "text-purple-700 font-bold border-purple-200 shadow-3d-sm" };
    case "FAILED":
      return { label: "Failed", bg: "bg-rose-50", text: "text-rose-700 font-bold border-rose-200 shadow-3d-sm" };
  }
}

export function getDeliveryStatusBadge(status: DeliveryStatus) {
  switch (status) {
    case "DELIVERED":
      return { label: "Delivered", bg: "bg-emerald-50", text: "text-emerald-700 font-bold border-emerald-200 shadow-3d-sm" };
    case "OUT_FOR_DELIVERY":
      return { label: "Out For Delivery", bg: "bg-pink-50", text: "text-pink-700 font-bold border-pink-200 shadow-3d-sm" };
    case "ASSIGNED":
      return { label: "Presenter Assigned", bg: "bg-blue-50", text: "text-blue-700 font-bold border-blue-200 shadow-3d-sm" };
    case "UNASSIGNED":
      return { label: "Unassigned", bg: "bg-amber-50", text: "text-amber-700 font-bold border-amber-200 shadow-3d-sm" };
    case "FAILED":
      return { label: "Delivery Failed", bg: "bg-rose-50", text: "text-rose-700 font-bold border-rose-200 shadow-3d-sm" };
    default:
      return { label: status, bg: "bg-slate-100", text: "text-slate-700 font-semibold border-slate-200 shadow-3d-sm" };
  }
}
