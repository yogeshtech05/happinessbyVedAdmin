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
import { Settings, Save, Sparkles, Phone, Mail, MapPin } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [businessName, setBusinessName] = useState("Happiness Deliver");
  const [brandTagline, setBrandTagline] = useState("");
  const [helplinePhone, setHelplinePhone] = useState("");
  const [helplineEmail, setHelplineEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [taxRatePercent, setTaxRatePercent] = useState("18");
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState("0");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState("1000");
  const [orderPrefix, setOrderPrefix] = useState("HD-");

  const { showToast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    const res = await apiRequest("/api/settings");
    if (res.success && res.data) {
      const s = res.data;
      setBusinessName("Happiness Deliver"); // Fixed brand rule
      setBrandTagline(s.brandTagline || "");
      setHelplinePhone(s.helplinePhone || "");
      setHelplineEmail(s.helplineEmail || "");
      setAddress(s.address || "");
      setCity(s.city || "");
      setState(s.state || "");
      setPincode(s.pincode || "");
      setCurrencySymbol(s.currencySymbol || "₹");
      setTaxRatePercent(s.taxRatePercent?.toString() || "18");
      setDefaultDeliveryFee(s.defaultDeliveryFee?.toString() || "0");
      setFreeDeliveryThreshold(s.freeDeliveryThreshold?.toString() || "1000");
      setOrderPrefix(s.orderPrefix || "HD-");
    } else {
      setError(res.error || "Failed to load store settings.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await apiRequest("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        businessName: "Happiness Deliver", // Enforced
        brandTagline,
        helplinePhone,
        helplineEmail,
        address,
        city,
        state,
        pincode,
        currencySymbol,
        taxRatePercent: parseFloat(taxRatePercent),
        defaultDeliveryFee: parseFloat(defaultDeliveryFee),
        freeDeliveryThreshold: parseFloat(freeDeliveryThreshold),
        orderPrefix,
        allowSameDayBooking: true,
        bookingCutoffTime: "18:00",
        autoAssignPresenters: false,
      }),
    });
    setSaving(false);

    if (res.success) {
      showToast("Store settings saved successfully!", "success");
      fetchSettings();
    } else {
      showToast(res.error || "Failed to save settings", "error");
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

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <PageHeader title="Store Configuration & Business Settings" />
        <ErrorState message={error} onRetry={fetchSettings} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Store Configuration & Settings"
        description="Manage Happiness Deliver store details, contact numbers, order prefix, and tax rules"
      />

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Brand Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-600" />
              Brand & Business Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Brand / Business Name (Locked)"
                value="Happiness Deliver"
                disabled
                className="bg-slate-100 border-slate-200 text-rose-600 font-extrabold shadow-3d-inset"
                helperText="Brand name is set to 'Happiness Deliver' throughout the platform."
              />
              <Input
                label="Brand Tagline"
                placeholder="e.g. Premium Surprise Gifting & Doorstep Delivery"
                value={brandTagline}
                onChange={(e) => setBrandTagline(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Helpline Phone Number"
                placeholder="+91 98765 43210"
                value={helplinePhone}
                onChange={(e) => setHelplinePhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
              />
              <Input
                label="Support Email"
                placeholder="hello@happinessdeliver.com"
                value={helplineEmail}
                onChange={(e) => setHelplineEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Headquarters & Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Street Address"
              placeholder="100 Executive Boulevard, Suite 400"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
              <Input
                label="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Operational & Tax Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Financial & Booking Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input
                label="Currency Symbol"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
              />
              <Input
                label="GST / Tax Rate (%)"
                type="number"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(e.target.value)}
              />
              <Input
                label="Order Prefix"
                value={orderPrefix}
                onChange={(e) => setOrderPrefix(e.target.value)}
              />
              <Input
                label="Free Delivery (₹)"
                type="number"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
