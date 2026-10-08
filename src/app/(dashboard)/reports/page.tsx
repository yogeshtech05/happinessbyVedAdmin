"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { apiRequest } from "@/services/apiService";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { BarChart3, Download, DollarSign, ShoppingBag, Star, RefreshCw } from "lucide-react";

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("30days");

  const { showToast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    const res = await apiRequest(`/api/reports?range=${range}`);
    if (res.success && res.data) {
      setReportData(res.data);
    } else {
      setError(res.error || "Failed to generate report.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [range]);

  const handleExportCSV = () => {
    if (!reportData) return;
    const summary = reportData.summary || {};
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Value\n" +
      `Total Sales Revenue,${summary.totalSales}\n` +
      `Total Completed Orders,${summary.totalOrders}\n` +
      `Average Order Value,${summary.avgOrderValue}\n` +
      `Total Discounts,${summary.totalDiscounts}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `happiness_deliver_report_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Report dataset exported to CSV", "success");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sales & Operations Analytics" />
        <ErrorState message={error} onRetry={fetchReports} />
      </div>
    );
  }

  const { summary, occasions, topPackages, deliveries } = reportData;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader
        title="Sales & Operations Analytics"
        description="Detailed breakdown of revenue, occasion trends, and package performance"
        action={
          <div className="flex items-center gap-3">
            <div className="w-40">
              <Select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                options={[
                  { value: "7days", label: "Last 7 Days" },
                  { value: "30days", label: "Last 30 Days" },
                  { value: "thisMonth", label: "This Month" },
                  { value: "allTime", label: "All Time" },
                ]}
              />
            </div>
            <Button variant="primary" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <p className="text-xs font-extrabold text-slate-500 uppercase">Gross Sales Revenue</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {formatCurrency(summary.totalSales || 0)}
            </h3>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-xs font-extrabold text-slate-500 uppercase">Successful Bookings</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{summary.totalOrders || 0}</h3>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-xs font-extrabold text-slate-500 uppercase">Average Order Value</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {formatCurrency(summary.avgOrderValue || 0)}
            </h3>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-xs font-extrabold text-slate-500 uppercase">Discounts Issued</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">
              {formatCurrency(summary.totalDiscounts || 0)}
            </h3>
          </CardHeader>
        </Card>
      </div>

      {/* Occasions Breakdown & Top Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Occasion Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Occasion</TableHead>
                  <TableHead>Order Count</TableHead>
                  <TableHead>Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {occasions.map((occ: any) => (
                  <TableRow key={occ.occasion}>
                    <TableCell className="capitalize font-bold text-slate-800 text-xs">
                      {occ.occasion}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 text-xs">{occ.count}</TableCell>
                    <TableCell className="font-bold text-emerald-600 text-xs">
                      {formatCurrency(parseFloat(occ.total_revenue || "0"))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Reviews</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPackages.map((pkg: any) => (
                  <TableRow key={pkg.title}>
                    <TableCell className="font-bold text-slate-900 text-xs">{pkg.title}</TableCell>
                    <TableCell className="font-bold text-rose-600 text-xs">
                      {formatCurrency(parseFloat(pkg.price))}
                    </TableCell>
                    <TableCell className="text-amber-500 font-bold text-xs flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {pkg.rating}
                    </TableCell>
                    <TableCell className="text-slate-500 font-medium text-xs">{pkg.review_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
