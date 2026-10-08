"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { apiRequest } from "@/services/apiService";
import { useToast } from "@/context/ToastContext";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function NewPackagePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [occasion, setOccasion] = useState("birthday");
  const [category, setCategory] = useState("Milestone Celebration");
  const [price, setPrice] = useState("1499");
  const [originalPrice, setOriginalPrice] = useState("1999");
  const [duration, setDuration] = useState("30 - 45 Minutes");
  const [badge, setBadge] = useState("Bestseller");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [imageTheme, setImageTheme] = useState("rose");

  const [highlights, setHighlights] = useState<string[]>([
    "Dedicated Female Surprise Presenter",
    "Handcrafted Designer Fresh Cream Cake",
    "Fresh Flower Arrangement",
  ]);
  const [inclusions, setInclusions] = useState<string[]>([
    "Customized Birthday Cake with personal message",
    "Female Host Doorstep Delivery",
  ]);

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !description) {
      showToast("Please complete required package fields.", "error");
      return;
    }

    setSaving(true);
    const res = await apiRequest("/api/packages", {
      method: "POST",
      body: JSON.stringify({
        title,
        tagline,
        occasion,
        occasionLabel: occasion.charAt(0).toUpperCase() + occasion.slice(1),
        category,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice),
        compareAtPrice: parseFloat(originalPrice),
        duration,
        badge,
        shortDescription,
        description,
        imageTheme,
        highlights: highlights.filter((h) => h.trim().length > 0),
        inclusions: inclusions.filter((i) => i.trim().length > 0),
        features: [{ title: "Female Host Delivery", included: true }],
        addons: [{ id: "addon-photo", name: "HD Reaction Video Highlights", price: 999, description: "Professional video reel" }],
        isActive: true,
      }),
    });
    setSaving(false);

    if (res.success) {
      showToast("Surprise package created successfully!", "success");
      router.push("/packages");
    } else {
      showToast(res.error || "Failed to create package", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      <Link
        href="/packages"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Packages List
      </Link>

      <PageHeader
        title="Create New Surprise Package"
        description="Design a new surprise experience package for customers to book"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Package Title *"
                placeholder="e.g. Midnight Birthday Celebration"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Input
                label="Tagline"
                placeholder="e.g. Unforgettable doorstep surprise"
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
                placeholder="e.g. Milestone Celebration"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <Input
                label="Badge Tag"
                placeholder="e.g. Bestseller / New"
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
                label="Original / Compare Price (₹)"
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

        {/* Descriptions & Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Descriptions & Inclusions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Short Description
              </label>
              <Input
                placeholder="Brief summary for package cards..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Full Package Description *
              </label>
              <textarea
                className="w-full bg-slate-950/70 text-slate-100 placeholder-slate-500 border border-slate-800 rounded-xl p-3.5 text-sm h-32 focus:outline-none focus:border-rose-500"
                placeholder="Detailed description of the surprise experience..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Dynamic Highlights List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Package Highlights</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setHighlights([...highlights, ""])}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Highlight
                </Button>
              </div>
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={h}
                    onChange={(e) => {
                      const copy = [...highlights];
                      copy[i] = e.target.value;
                      setHighlights(copy);
                    }}
                    placeholder="e.g. Dedicated Female Presenter"
                  />
                  <button
                    type="button"
                    onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))}
                    className="p-2 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/packages">
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
            Create & Publish Package
          </Button>
        </div>
      </form>
    </div>
  );
}
