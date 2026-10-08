"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { apiRequest } from "@/services/apiService";
import { useToast } from "@/context/ToastContext";
import { FileText, Save, Edit } from "lucide-react";

export default function ContentPage() {
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  const fetchContent = async () => {
    setLoading(true);
    setError("");
    const res = await apiRequest("/api/content");
    if (res.success && res.data) {
      setContentItems(res.data);
    } else {
      setError(res.error || "Failed to load CMS content.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleStartEdit = (item: any) => {
    setEditingKey(item.sectionKey);
    setTitle(item.title);
    setSubtitle(item.subtitle || "");
    setContent(item.content);
  };

  const handleSaveContent = async (sectionKey: string) => {
    setSaving(true);
    const res = await apiRequest("/api/content", {
      method: "PUT",
      body: JSON.stringify({
        sectionKey,
        title,
        subtitle,
        content,
      }),
    });
    setSaving(false);

    if (res.success) {
      showToast("Website CMS section updated!", "success");
      setEditingKey(null);
      fetchContent();
    } else {
      showToast(res.error || "Failed to update content", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Website Content Management (CMS)"
        description="Update homepage hero headlines, banner announcements, and marketing text without changing source code"
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchContent} />
      ) : (
        <div className="space-y-6">
          {contentItems.map((item) => {
            const isEditing = editingKey === item.sectionKey;
            return (
              <Card key={item.sectionKey}>
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <CardTitle className="capitalize text-rose-600 font-mono font-bold text-sm">
                      Section: {item.sectionKey.replace("_", " ")}
                    </CardTitle>
                    <p className="text-[10px] text-slate-400 font-medium">Updated by: {item.updatedBy}</p>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEdit(item)}
                      leftIcon={<Edit className="w-3.5 h-3.5" />}
                    >
                      Edit Section
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        label="Section Title *"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />

                      <Input
                        label="Subtitle"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                      />

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Body Content *
                        </label>
                        <textarea
                          className="w-full bg-[#f8fafc] text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl p-3 text-xs h-28 shadow-3d-inset focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 focus:shadow-3d"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          required
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingKey(null)}>
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={saving}
                          onClick={() => handleSaveContent(item.sectionKey)}
                          leftIcon={<Save className="w-3.5 h-3.5" />}
                        >
                          Save CMS Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-500">Headline:</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{item.title}</p>
                      </div>
                      {item.subtitle && (
                        <div>
                          <span className="font-bold text-slate-500">Subtitle:</span>
                          <p className="text-slate-700 font-medium mt-0.5">{item.subtitle}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-500">Content:</span>
                        <p className="text-slate-700 font-medium mt-0.5">{item.content}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
