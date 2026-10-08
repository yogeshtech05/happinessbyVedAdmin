"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { apiRequest } from "@/services/apiService";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Search, Plus, Edit, Trash2, Eye, Star, Gift, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [occasionFilter, setOccasionFilter] = useState("ALL");
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchPackages = async () => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ search, occasion: occasionFilter });
    const res = await apiRequest(`/api/packages?${query.toString()}`);
    if (res.success && res.data) {
      setPackages(res.data);
    } else {
      setError(res.error || "Failed to fetch packages.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, [search, occasionFilter]);

  const handleDeletePackage = async () => {
    if (!deleteModalId) return;
    setDeleting(true);
    const res = await apiRequest(`/api/packages/${deleteModalId}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteModalId(null);

    if (res.success) {
      showToast("Package deleted successfully", "success");
      fetchPackages();
    } else {
      showToast(res.error || "Failed to delete package", "error");
    }
  };

  const togglePublishStatus = async (pkg: any) => {
    const res = await apiRequest(`/api/packages/${pkg.id}`, {
      method: "PUT",
      body: JSON.stringify({ isActive: !pkg.isActive }),
    });
    if (res.success) {
      showToast(`Package ${!pkg.isActive ? "published" : "unpublished"}`, "info");
      fetchPackages();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Surprise Package Management"
        description="Create, publish, and configure surprise experiences"
        action={
          <Link href="/packages/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Create New Package
            </Button>
          </Link>
        }
      />

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search packages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="h-10 text-xs bg-[#f8fafc]"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={occasionFilter}
            onChange={(e) => setOccasionFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All Occasions" },
              { value: "birthday", label: "Birthday" },
              { value: "anniversary", label: "Anniversary" },
              { value: "parents", label: "For Parents" },
              { value: "romantic", label: "Romantic" },
              { value: "congratulations", label: "Congratulations" },
              { value: "festivals", label: "Festivals" },
            ]}
          />
        </div>
      </div>

      {/* Packages Content */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPackages} />
      ) : packages.length === 0 ? (
        <EmptyState title="No packages found" description="Create a new package to list surprise experiences." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package Title</TableHead>
              <TableHead>Occasion</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-sm">{pkg.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{pkg.slug}</span>
                  </div>
                </TableCell>
                <TableCell className="capitalize text-rose-600 font-semibold text-xs">
                  {pkg.occasionLabel || pkg.occasion}
                </TableCell>
                <TableCell className="text-xs text-slate-600 font-medium">{pkg.category}</TableCell>
                <TableCell className="font-bold text-slate-900">
                  {formatCurrency(pkg.price)}
                  {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                    <span className="text-[10px] text-slate-400 line-through ml-1.5 font-normal">
                      {formatCurrency(pkg.originalPrice)}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{pkg.rating}</span>
                    <span className="text-slate-400 font-medium text-[10px]">({pkg.reviewCount})</span>
                  </div>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => togglePublishStatus(pkg)}
                    className="focus:outline-none"
                    title="Click to toggle status"
                  >
                    <Badge variant={pkg.isActive ? "success" : "danger"}>
                      {pkg.isActive ? "Published" : "Draft"}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/packages/${pkg.id}`}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 shadow-3d-sm transition"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/packages/${pkg.id}/edit`}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 shadow-3d-sm transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteModalId(pkg.id)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteModalId}
        onClose={() => setDeleteModalId(null)}
        onConfirm={handleDeletePackage}
        title="Delete Surprise Package?"
        message="Are you sure you want to delete this package? This operation cannot be undone."
        isLoading={deleting}
      />
    </div>
  );
}
