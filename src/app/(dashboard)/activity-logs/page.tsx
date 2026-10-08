"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { apiRequest } from "@/services/apiService";
import { formatDateTime } from "@/lib/utils";
import { History, Search, ShieldAlert } from "lucide-react";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ search });
    const res = await apiRequest(`/api/activity-logs?${query.toString()}`);
    if (res.success && res.data) {
      setLogs(res.data);
    } else {
      setError(res.error || "Failed to load audit logs.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [search]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Administrative Audit Logs"
        description="Comprehensive audit trail recording all admin logins, package edits, order status updates, and settings changes"
      />

      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm">
        <div className="w-full sm:w-96">
          <Input
            placeholder="Search by admin name, action, or details..."
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
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLogs} />
      ) : logs.length === 0 ? (
        <EmptyState title="No audit logs recorded" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Admin User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-slate-500 font-mono font-medium">
                  {formatDateTime(log.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-xs">{log.adminName}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{log.adminEmail}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-rose-600 font-bold border-rose-200 bg-rose-50 shadow-3d-sm">
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-700 font-mono font-semibold">{log.entityType}</TableCell>
                <TableCell className="text-xs text-slate-700 font-medium max-w-sm truncate">
                  {log.details}
                </TableCell>
                <TableCell className="text-xs text-slate-400 font-mono">
                  {log.ipAddress || "127.0.0.1"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
