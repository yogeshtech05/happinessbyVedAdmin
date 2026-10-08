"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { apiRequest } from "@/services/apiService";
import { Cake, Heart, Users, Sparkles, Folder } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    const res = await apiRequest("/api/categories");
    if (res.success && res.data) {
      setCategories(res.data);
    } else {
      setError(res.error || "Failed to load categories.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Occasion & Surprise Categories"
        description="Browse milestone categories, occasion tags, and active package distributions"
      />

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCategories} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Tagline</TableHead>
              <TableHead>Icon Symbol</TableHead>
              <TableHead>Listed Packages</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-bold text-white text-xs">{cat.name}</TableCell>
                <TableCell className="font-mono text-xs text-rose-300">{cat.slug}</TableCell>
                <TableCell className="text-xs text-slate-300">{cat.tagline}</TableCell>
                <TableCell className="text-xs text-slate-400 font-mono">{cat.icon}</TableCell>
                <TableCell>
                  <Badge variant="info">{cat.packageCount} Packages</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
