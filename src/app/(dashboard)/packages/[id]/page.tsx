"use client";

import React, { useEffect, useState, use } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { apiRequest } from "@/services/apiService";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Edit, Star, CheckCircle2, Clock, Sparkles } from "lucide-react";
import Link from "next/link";

export default function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPackage = async () => {
      setLoading(true);
      setError("");
      const res = await apiRequest(`/api/packages/${id}`);
      if (res.success && res.data) {
        setPkg(res.data);
      } else {
        setError(res.error || "Package not found.");
      }
      setLoading(false);
    };

    fetchPackage();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="space-y-6">
        <Link href="/packages" className="text-xs font-semibold text-rose-400 hover:underline">
          ← Back to Packages
        </Link>
        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      <Link
        href="/packages"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Packages List
      </Link>

      <PageHeader
        title={pkg.title}
        description={pkg.tagline}
        action={
          <Link href={`/packages/${pkg.id}/edit`}>
            <Button variant="primary" leftIcon={<Edit className="w-4 h-4" />}>
              Edit Package
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 space-y-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant={pkg.isActive ? "success" : "danger"}>
                {pkg.isActive ? "Published" : "Draft"}
              </Badge>
              <span className="text-xs text-rose-300 font-semibold capitalize">
                Occasion: {pkg.occasionLabel || pkg.occasion}
              </span>
            </div>
            <CardTitle className="text-xl mt-2">{pkg.title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Full Description
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed">{pkg.description}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Highlights
              </h4>
              <div className="space-y-1.5">
                {pkg.highlights.map((h: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Duration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <p className="text-slate-400">Current Selling Price</p>
                <p className="text-2xl font-bold text-rose-400">{formatCurrency(pkg.price)}</p>
              </div>
              {pkg.originalPrice && (
                <div>
                  <p className="text-slate-400">Original Price</p>
                  <p className="text-sm font-semibold text-slate-400 line-through">
                    {formatCurrency(pkg.originalPrice)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-slate-400">Experience Duration</p>
                <p className="text-sm font-medium text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4 text-amber-400" /> {pkg.duration}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Customer Rating</p>
                <p className="text-sm font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                  <Star className="w-4 h-4 fill-amber-400" /> {pkg.rating} ({pkg.reviewCount} Reviews)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
