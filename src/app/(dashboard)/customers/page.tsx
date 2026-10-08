"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { apiRequest } from "@/services/apiService";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, Eye, Phone, Mail, MapPin, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ search });
    const res = await apiRequest(`/api/customers?${query.toString()}`);
    if (res.success && res.data) {
      setCustomers(res.data);
    } else {
      setError(res.error || "Failed to load customers.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Customer Directory"
        description="View registered customer accounts, order frequency, and total spending"
      />

      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm">
        <div className="w-full sm:w-96">
          <Input
            placeholder="Search by customer name, email, phone, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="h-10 text-xs bg-[#f8fafc]"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCustomers} />
      ) : customers.length === 0 ? (
        <EmptyState title="No customers found" description="No customer accounts match your query." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-xs shadow-3d-sm">
                      {c.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900">{c.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs text-slate-700 space-y-0.5 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400" /> {c.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-600 font-medium">{c.city || "N/A"}</TableCell>
                <TableCell className="font-bold text-slate-800">{c.totalOrders}</TableCell>
                <TableCell className="font-bold text-emerald-600">
                  {formatCurrency(c.totalSpent)}
                </TableCell>
                <TableCell>
                  <Badge variant={c.status === "ACTIVE" ? "success" : "danger"}>{c.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/customers/${c.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-rose-600 border border-slate-200 shadow-3d-sm active:translate-y-0.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Profile
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
