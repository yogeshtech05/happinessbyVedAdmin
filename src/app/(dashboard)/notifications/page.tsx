"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { apiRequest } from "@/services/apiService";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Bell, Send, Plus } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetAudience, setTargetAudience] = useState("ALL_CUSTOMERS");
  const [sending, setSending] = useState(false);

  const { showToast } = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    const res = await apiRequest("/api/notifications");
    if (res.success && res.data) {
      setNotifications(res.data);
    } else {
      setError(res.error || "Failed to load notification logs.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      showToast("Please enter title and message body", "error");
      return;
    }

    setSending(true);
    const res = await apiRequest("/api/notifications", {
      method: "POST",
      body: JSON.stringify({ title, body, targetAudience }),
    });
    setSending(false);

    if (res.success) {
      showToast("Notification broadcast dispatched!", "success");
      setIsModalOpen(false);
      setTitle("");
      setBody("");
      fetchNotifications();
    } else {
      showToast(res.error || "Failed to send notification", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Broadcast Notifications"
        description="Dispatch announcements and promotional notifications to customer groups"
        action={
          <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<Send className="w-4 h-4" />}>
            Send Broadcast
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNotifications} />
      ) : notifications.length === 0 ? (
        <EmptyState title="No broadcast history" description="Send a notification to inform customers about surprise deals." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Notification Title</TableHead>
              <TableHead>Message Body</TableHead>
              <TableHead>Target Group</TableHead>
              <TableHead>Sent By</TableHead>
              <TableHead>Sent Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((n) => (
              <TableRow key={n.id}>
                <TableCell className="font-bold text-slate-900 text-xs">{n.title}</TableCell>
                <TableCell className="text-xs text-slate-600 font-medium max-w-xs truncate">{n.body}</TableCell>
                <TableCell className="text-xs text-rose-600 font-bold">{n.targetAudience}</TableCell>
                <TableCell className="text-xs text-slate-500 font-medium">{n.sentBy}</TableCell>
                <TableCell className="text-xs text-slate-500 font-medium">{formatDateTime(n.sentAt)}</TableCell>
                <TableCell>
                  <Badge variant="success">{n.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Compose & Send Notification"
      >
        <form onSubmit={handleSendNotification} className="space-y-4">
          <Input
            label="Notification Title *"
            placeholder="e.g. Special Festive Discount!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Select
            label="Target Audience *"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            options={[
              { value: "ALL_CUSTOMERS", label: "All Customers" },
              { value: "VIP_CUSTOMERS", label: "Repeat Customers" },
              { value: "ADMINS", label: "Admin & Staff Team Only" },
            ]}
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Message Body *
            </label>
            <textarea
              className="w-full bg-[#f8fafc] text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl p-3.5 text-sm h-28 shadow-3d-inset focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 focus:shadow-3d"
              placeholder="Type notification text..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={sending} leftIcon={<Send className="w-4 h-4" />}>
              Send Notification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
