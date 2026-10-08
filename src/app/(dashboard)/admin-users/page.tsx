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
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { apiRequest } from "@/services/apiService";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { UserCheck, Plus, Trash2, Edit2, ShieldAlert } from "lucide-react";

export default function AdminUsersPage() {
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("role-staff");
  const [status, setStatus] = useState("ACTIVE");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchAdminUsersAndRoles = async () => {
    setLoading(true);
    setError("");
    const [uRes, rRes] = await Promise.all([
      apiRequest("/api/admin-users"),
      apiRequest("/api/roles"),
    ]);

    if (uRes.success && uRes.data) {
      setAdminUsers(uRes.data);
    } else {
      setError(uRes.error || "Failed to load admin team.");
    }

    if (rRes.success && rRes.data) {
      setRoles(rRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminUsersAndRoles();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRoleId("role-staff");
    setStatus("ACTIVE");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword("");
    setRoleId(u.roleId);
    setStatus(u.status);
    setIsModalOpen(true);
  };

  const handleSaveAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || (!editingUser && !password)) {
      showToast("Please complete required fields", "error");
      return;
    }

    setSaving(true);
    const endpoint = editingUser ? `/api/admin-users/${editingUser.id}` : "/api/admin-users";
    const method = editingUser ? "PUT" : "POST";

    const res = await apiRequest(endpoint, {
      method,
      body: JSON.stringify({
        name,
        email,
        password: password || undefined,
        roleId,
        status,
      }),
    });
    setSaving(false);

    if (res.success) {
      showToast(editingUser ? "Admin user updated" : "Admin user created successfully", "success");
      setIsModalOpen(false);
      fetchAdminUsersAndRoles();
    } else {
      showToast(res.error || "Failed to save admin user", "error");
    }
  };

  const handleDeleteAdminUser = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await apiRequest(`/api/admin-users/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteId(null);

    if (res.success) {
      showToast("Admin account deleted", "success");
      fetchAdminUsersAndRoles();
    } else {
      showToast(res.error || "Failed to delete admin user", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Admin Team Management"
        description="Manage admin staff, manager accounts, and role assignments"
        action={
          <Button variant="primary" onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Add Admin User
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAdminUsersAndRoles} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-xs shadow-3d-sm">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900 text-xs">{u.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-600 font-medium">{u.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 shadow-3d-sm font-bold">
                    {u.roleName}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.status === "ACTIVE" ? "success" : "danger"}>{u.status}</Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-500 font-medium">
                  {formatDateTime(u.lastLoginAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 shadow-3d-sm transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(u.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 shadow-3d-sm transition"
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit Admin User" : "Create New Admin User"}
      >
        <form onSubmit={handleSaveAdminUser} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Sneha Patel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="sneha@happinessdeliver.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label={editingUser ? "New Password (Leave blank to keep current)" : "Password *"}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editingUser}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assigned Role *"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              options={roles.map((r) => ({ value: r.id, label: r.name }))}
            />
            <Select
              label="Account Status *"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "SUSPENDED", label: "Suspended" },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingUser ? "Update Admin" : "Create Admin Account"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteAdminUser}
        title="Revoke Admin Access?"
        message="Are you sure you want to delete this admin user account?"
        isLoading={deleting}
      />
    </div>
  );
}
