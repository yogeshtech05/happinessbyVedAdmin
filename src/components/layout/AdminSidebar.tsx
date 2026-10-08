"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Gift,
  PackageCheck,
  Truck,
  Ticket,
  Star,
  Bell,
  BarChart3,
  FileText,
  UserCheck,
  ShieldAlert,
  History,
  Settings,
  LogOut,
  Sparkles,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({ isOpenMobile, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuth();

  const navigationSections = [
    {
      title: "OVERVIEW",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          code: "dashboard.view",
        },
      ],
    },
    {
      title: "STORE OPERATIONS",
      items: [
        {
          label: "Orders",
          href: "/orders",
          icon: ShoppingBag,
          code: "orders.view",
        },
        {
          label: "Customers",
          href: "/customers",
          icon: Users,
          code: "customers.view",
        },
        {
          label: "Packages",
          href: "/packages",
          icon: Gift,
          code: "packages.view",
        },
        {
          label: "Products & Services",
          href: "/products",
          icon: PackageCheck,
          code: "products.view",
        },
        {
          label: "Deliveries",
          href: "/deliveries",
          icon: Truck,
          code: "deliveries.view",
        },
      ],
    },
    {
      title: "MARKETING & REVIEWS",
      items: [
        {
          label: "Coupons",
          href: "/coupons",
          icon: Ticket,
          code: "coupons.view",
        },
        {
          label: "Reviews",
          href: "/reviews",
          icon: Star,
          code: "reviews.view",
        },
        {
          label: "Notifications",
          href: "/notifications",
          icon: Bell,
          code: "notifications.view",
        },
        {
          label: "Reports",
          href: "/reports",
          icon: BarChart3,
          code: "reports.view",
        },
        {
          label: "Content (CMS)",
          href: "/content",
          icon: FileText,
          code: "content.view",
        },
      ],
    },
    {
      title: "ADMINISTRATION",
      items: [
        {
          label: "Admin Users",
          href: "/admin-users",
          icon: UserCheck,
          code: "admin_users.view",
        },
        {
          label: "Roles & Permissions",
          href: "/roles",
          icon: ShieldAlert,
          code: "roles.view",
        },
        {
          label: "Activity Logs",
          href: "/activity-logs",
          icon: History,
          code: "activity_logs.view",
        },
        {
          label: "Settings",
          href: "/settings",
          icon: Settings,
          code: "settings.view",
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-white/95 backdrop-blur-md border-r border-slate-200/90 shadow-3d-lg transition-transform duration-300 ease-in-out md:translate-x-0 md:static",
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 bg-slate-50/60">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white shadow-3d-rose border border-white/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-slate-900 tracking-tight group-hover:text-rose-600 transition">
                Happiness Deliver
              </span>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-rose-600">
                ADMIN CONSOLE
              </span>
            </div>
          </Link>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 md:hidden shadow-3d-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          {navigationSections.map((section, sIdx) => {
            const visibleItems = section.items.filter((item) => hasPermission(item.code));
            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-1.5">
                <h4 className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {section.title}
                </h4>
                {visibleItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                        isActive
                          ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-3d-rose border-b border-rose-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isActive ? "text-white" : "text-slate-400 group-hover:text-rose-500"
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom Admin Profile Card */}
        {user && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/80">
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-sm shrink-0 shadow-3d-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-rose-600 font-semibold truncate">
                    {user.roleName}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0 shadow-3d-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
