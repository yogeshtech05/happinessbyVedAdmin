"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { apiRequest } from "@/services/apiService";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Star, CheckCircle, XCircle, Trash2 } from "lucide-react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { showToast } = useToast();

  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    const res = await apiRequest("/api/reviews");
    if (res.success && res.data) {
      setReviews(res.data);
    } else {
      setError(res.error || "Failed to load reviews.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateReviewStatus = async (id: string, status: string, isFeatured: boolean) => {
    const res = await apiRequest(`/api/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status, isFeatured }),
    });

    if (res.success) {
      showToast(`Review ${status.toLowerCase()}`, "info");
      fetchReviews();
    } else {
      showToast(res.error || "Failed to update review", "error");
    }
  };

  const handleDeleteReview = async (id: string) => {
    const res = await apiRequest(`/api/reviews/${id}`, { method: "DELETE" });
    if (res.success) {
      showToast("Review deleted", "success");
      fetchReviews();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Customer Feedback & Reviews"
        description="Moderate customer testimonials, ratings, and featured review badges"
      />

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReviews} />
      ) : reviews.length === 0 ? (
        <EmptyState title="No customer reviews yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Package Reference</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Moderate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{r.customerName}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{r.customerEmail}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-rose-600 font-bold">
                  {r.packageName || "General Surprise Review"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {r.rating} / 5
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs space-y-1">
                    <p className="font-bold text-slate-900 text-xs">&ldquo;{r.title}&rdquo;</p>
                    <p className="text-[11px] text-slate-600 font-medium line-clamp-2">{r.comment}</p>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-500 font-medium">{formatDate(r.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={r.status === "APPROVED" ? "success" : "danger"}>
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {r.status !== "APPROVED" && (
                      <button
                        onClick={() => handleUpdateReviewStatus(r.id, "APPROVED", true)}
                        className="p-1.5 rounded-xl text-emerald-600 hover:bg-emerald-50 shadow-3d-sm transition"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {r.status !== "REJECTED" && (
                      <button
                        onClick={() => handleUpdateReviewStatus(r.id, "REJECTED", false)}
                        className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 shadow-3d-sm transition"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReview(r.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 shadow-3d-sm transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
