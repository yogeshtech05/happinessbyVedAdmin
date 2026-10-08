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
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Search, Plus, Edit2, Trash2, PackageCheck, Cake, Flower2, Gift, Camera } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Cakes");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sku, setSku] = useState("");
  const [stockQuantity, setStockQuantity] = useState("50");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ search, category: categoryFilter });
    const res = await apiRequest(`/api/products?${query.toString()}`);
    if (res.success && res.data) {
      setProducts(res.data);
    } else {
      setError(res.error || "Failed to load products.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingProd(null);
    setName("");
    setCategory("Cakes");
    setPrice("599");
    setCostPrice("250");
    setSku(`PROD-${Math.floor(1000 + Math.random() * 9000)}`);
    setStockQuantity("50");
    setDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: any) => {
    setEditingProd(prod);
    setName(prod.name);
    setCategory(prod.category);
    setPrice(prod.price.toString());
    setCostPrice(prod.costPrice?.toString() || "");
    setSku(prod.sku);
    setStockQuantity(prod.stockQuantity.toString());
    setDescription(prod.description || "");
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      showToast("Please fill product name and price", "error");
      return;
    }

    setSaving(true);
    const endpoint = editingProd ? `/api/products/${editingProd.id}` : "/api/products";
    const method = editingProd ? "PUT" : "POST";

    const res = await apiRequest(endpoint, {
      method,
      body: JSON.stringify({
        name,
        category,
        price: parseFloat(price),
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        sku,
        stockQuantity: parseInt(stockQuantity || "0", 10),
        isAvailable: true,
        description,
      }),
    });
    setSaving(false);

    if (res.success) {
      showToast(editingProd ? "Product updated" : "Product added to inventory", "success");
      setIsModalOpen(false);
      fetchProducts();
    } else {
      showToast(res.error || "Failed to save product", "error");
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await apiRequest(`/api/products/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteId(null);

    if (res.success) {
      showToast("Product removed from inventory", "success");
      fetchProducts();
    } else {
      showToast(res.error || "Failed to delete product", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Products & Service Inventory"
        description="Manage cakes, flowers, customized gifts, surprise presenters, and add-ons"
        action={
          <Button variant="primary" onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Add New Item
          </Button>
        }
      />

      {/* Category Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-3d-sm">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search items or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="h-10 text-xs bg-[#f8fafc]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "Cakes", "Flowers", "Gifts", "Presenters", "Photography"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-3d-sm ${
                categoryFilter === cat
                  ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-3d-rose border-b border-rose-700"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200"
              }`}
            >
              {cat === "ALL" ? "All Inventory" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProducts} />
      ) : products.length === 0 ? (
        <EmptyState title="No items found" description="Add items to manage prices and stock availability." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Cost Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((prod) => (
              <TableRow key={prod.id}>
                <TableCell className="font-mono text-xs font-bold text-slate-900">
                  {prod.sku}
                </TableCell>
                <TableCell>
                  <span className="font-bold text-slate-900">{prod.name}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize text-slate-700 font-semibold">
                    {prod.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold text-rose-600">
                  {formatCurrency(prod.price)}
                </TableCell>
                <TableCell className="text-xs text-slate-500 font-medium">
                  {prod.costPrice ? formatCurrency(prod.costPrice) : "N/A"}
                </TableCell>
                <TableCell className="font-bold text-slate-800">
                  {prod.stockQuantity}
                </TableCell>
                <TableCell>
                  <Badge variant={prod.isAvailable ? "success" : "danger"}>
                    {prod.isAvailable ? "In Stock" : "Out of Stock"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 shadow-3d-sm transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(prod.id)}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProd ? "Edit Inventory Item" : "Add New Inventory Item"}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <Input
            label="Item Name *"
            placeholder="e.g. Belgian Truffle Chocolate Cake"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category *"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: "Cakes", label: "Cakes" },
                { value: "Flowers", label: "Flowers" },
                { value: "Gifts", label: "Gifts" },
                { value: "Presenters", label: "Presenters" },
                { value: "Photography", label: "Photography" },
                { value: "Add-ons", label: "Add-ons" },
              ]}
            />
            <Input
              label="SKU Code"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Selling Price (₹) *"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Cost Price (₹)"
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
            />
            <Input
              label="Stock Quantity"
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
          </div>

          <Input
            label="Description"
            placeholder="Item description or notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingProd ? "Update Item" : "Add Item"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteProduct}
        title="Delete Item?"
        message="Are you sure you want to remove this item from store inventory?"
        isLoading={deleting}
      />
    </div>
  );
}
