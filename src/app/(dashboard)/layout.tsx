"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-600">
        <div className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-white/80 border border-slate-200/80 shadow-3d backdrop-blur-md">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            AUTHENTICATING HAPPINESS DELIVER CONSOLE...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800">
      {/* Sidebar */}
      <AdminSidebar
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onOpenMobile={() => setIsOpenMobile(true)} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
