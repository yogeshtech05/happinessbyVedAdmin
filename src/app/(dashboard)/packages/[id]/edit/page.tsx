"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiRequest } from "@/services/apiService";
import { useToast } from "@/context/ToastContext";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [occasion, setOccasion] = useState("birthday");
  const [category, setCategory] = useState("Milestone Celebration");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [badge, setBadge] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);

  useEffect(() => {
    const fetchPkg = async () => {
      setLoading(true);
      const res = await apiRequest(`/api/packages/${id}`);
      if (res.success && res.data) {
        const pkg = res.data;
        setTitle(pkg.title || "");
        setTagline(pkg.tagline || "");
        setOccasion(pkg.occasion || "birthday");
        setCategory(pkg.category || "Milestone Celebration");
        setPrice(pkg.price?.toString() || "");
        setOriginalPrice(pkg.originalPrice?.toString() || "");
        setDuration(pkg.duration || "30-45 Mins");
        setBadge(pkg.badge || "");
        setShortDescription(pkg.shortDescription || "");
        setDescription(pkg.description || "");
        setHighlights(pkg.highlights || []);
      }
      setLoading(false);
    };

    fetchPkg();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await apiRequest(`/api/packages/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        title,
        tagline,
        occasion,
        occasionLabel: occasion.charAt(0).toUpperCase() + occasion.slice(1),
        category,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice),
        duration,
        badge,
        shortDescription,
        description,
        highlights: highlights.filter((h) => h.trim().length > 0),
      }),
    });
    setSaving(false);

    if (res.success) {
      showToast("Package updated successfully!", "success");
      router.push(`/packages/${id}`);
    } else {
      showToast(res.error || "Failed to update package", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      <Link
        href={`/packages/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Package Details
      </Link>

      <PageHeader title={`Edit Package: ${title}`} description="Update package pricing and options" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Package Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Input
                label="Tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Occasion *"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                options={[
                  { value: "birthday", label: "Birthday" },
                  { value: "anniversary", label: "Anniversary" },
                  { value: "parents", label: "For Parents" },
                  { value: "romantic", label: "Romantic" },
                  { value: "congratulations", label: "Congratulations" },
                  { value: "festivals", label: "Festivals" },
                ]}
              />
              <Input
                label="Category *"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <Input
                label="Badge Tag"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Package Price (₹) *"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <Input
                label="Original Price (₹)"
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
              />
              <Input
                label="Duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description & Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Full Package Description *
              </label>
              <textarea
                className="w-full bg-slate-950/70 text-slate-100 placeholder-slate-500 border border-slate-800 rounded-xl p-3.5 text-sm h-32 focus:outline-none focus:border-rose-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href={`/packages/${id}`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
