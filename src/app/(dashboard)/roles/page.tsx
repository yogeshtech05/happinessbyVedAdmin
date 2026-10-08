"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { PERMISSIONS } from "@/config/permissions";
import { apiRequest } from "@/services/apiService";
import { useToast } from "@/context/ToastContext";
import { ShieldCheck, CheckCircle, Save, Lock } from "lucide-react";

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    const res = await apiRequest("/api/roles");
    if (res.success && res.data) {
      setRoles(res.data);
      if (res.data.length > 0 && !selectedRole) {
        setSelectedRole(res.data[0]);
        setActivePermissions(res.data[0].permissions || []);
      }
    } else {
      setError(res.error || "Failed to load RBAC roles.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSelectRole = (role: any) => {
    setSelectedRole(role);
    setActivePermissions(role.permissions || []);
  };

  const togglePermission = (code: string) => {
    if (selectedRole?.name === "Super Admin") return;
    if (activePermissions.includes(code)) {
      setActivePermissions(activePermissions.filter((p) => p !== code));
    } else {
      setActivePermissions([...activePermissions, code]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    const res = await apiRequest("/api/roles", {
      method: "PUT",
      body: JSON.stringify({
        roleId: selectedRole.id,
        permissions: activePermissions,
      }),
    });
    setSaving(false);

    if (res.success) {
      showToast(`Updated permission matrix for ${selectedRole.name}`, "success");
      fetchRoles();
    } else {
      showToast(res.error || "Failed to update permissions", "error");
    }
  };

  const permissionCategories = Array.from(new Set(PERMISSIONS.map((p) => p.category)));

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Role-Based Access Control (RBAC)"
        description="Configure granular permission assignments for Super Admin, Admin, Manager, and Staff roles"
      />

      {loading ? (
        <Skeleton className="h-96" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRoles} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Roles List */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-1">
              System Roles
            </h4>
            {roles.map((r) => {
              const isSelected = selectedRole?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectRole(r)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-rose-50 border-rose-300 shadow-3d-rose"
                      : "bg-white border-slate-200/90 shadow-3d-sm hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className={`font-bold text-sm ${isSelected ? "text-rose-900" : "text-slate-900"}`}>{r.name}</h5>
                    {r.isSystem && (
                      <Badge variant="outline" className="text-[10px] bg-white text-slate-600 border-slate-200 shadow-3d-sm">
                        System
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">{r.description}</p>
                </div>
              );
            })}
          </div>

          {/* Permissions Matrix */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-600" />
                  Permissions Matrix: {selectedRole?.name}
                </CardTitle>
                {selectedRole?.name === "Super Admin" && (
                  <p className="text-xs text-amber-700 flex items-center gap-1 mt-1 font-semibold">
                    <Lock className="w-3.5 h-3.5 text-amber-600" /> Super Admin has all system permissions by default.
                  </p>
                )}
              </div>
              {selectedRole?.name !== "Super Admin" && (
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={saving}
                  onClick={handleSavePermissions}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Matrix
                </Button>
              )}
            </CardHeader>

            <CardContent className="pt-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {permissionCategories.map((category) => {
                const categoryPermissions = PERMISSIONS.filter((p) => p.category === category);
                return (
                  <div key={category} className="space-y-2">
                    <h5 className="text-xs font-extrabold text-rose-600 uppercase tracking-wider border-b border-slate-100 pb-1">
                      {category}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {categoryPermissions.map((perm) => {
                        const isChecked =
                          selectedRole?.name === "Super Admin" ||
                          activePermissions.includes(perm.code);

                        return (
                          <label
                            key={perm.code}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                              isChecked
                                ? "bg-white border-slate-200 text-slate-900 shadow-3d-sm"
                                : "bg-[#f8fafc] border-slate-200/60 text-slate-500 opacity-70"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={selectedRole?.name === "Super Admin"}
                              onChange={() => togglePermission(perm.code)}
                              className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                            />
                            <div>
                              <span className="font-bold block">{perm.name}</span>
                              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                                {perm.code}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
