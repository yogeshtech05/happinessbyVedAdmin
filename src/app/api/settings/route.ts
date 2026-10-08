import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const { user, error } = await requireAuthAndPermission("settings.view");
  if (error) return error;

  try {
    const db = await getDb();
    const res = await db.query("SELECT * FROM store_settings WHERE id = 'main';");

    if (!res.rows || res.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          businessName: "Happiness Deliver",
          brandTagline: "Premium Surprise Gifting & Doorstep Delivery",
          helplinePhone: "+91 98765 43210",
          helplineEmail: "hello@happinessdeliver.com",
          address: "100 Executive Boulevard, Suite 400",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          currencySymbol: "₹",
          taxRatePercent: 18.0,
          defaultDeliveryFee: 0.0,
          freeDeliveryThreshold: 1000.0,
          orderPrefix: "HD-",
          allowSameDayBooking: true,
          bookingCutoffTime: "18:00",
          autoAssignPresenters: false,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    const row = res.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        businessName: row.business_name || "Happiness Deliver",
        brandTagline: row.brand_tagline,
        helplinePhone: row.helpline_phone,
        helplineEmail: row.helpline_email,
        address: row.address,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        currencySymbol: row.currency_symbol,
        taxRatePercent: parseFloat(row.tax_rate_percent || "18.0"),
        defaultDeliveryFee: parseFloat(row.default_delivery_fee || "0.0"),
        freeDeliveryThreshold: parseFloat(row.free_delivery_threshold || "1000.0"),
        orderPrefix: row.order_prefix,
        allowSameDayBooking: row.allow_same_day_booking,
        bookingCutoffTime: row.booking_cutoff_time,
        autoAssignPresenters: row.auto_assign_presenters,
        updatedAt: row.updated_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("settings.update");
  if (error) return error;

  try {
    const body = await req.json();
    const db = await getDb();

    // Ensure businessName stays "Happiness Deliver"
    const businessName = "Happiness Deliver";

    await db.query(
      `UPDATE store_settings SET
        business_name = $1, brand_tagline = $2, helpline_phone = $3, helpline_email = $4,
        address = $5, city = $6, state = $7, pincode = $8, currency_symbol = $9,
        tax_rate_percent = $10, default_delivery_fee = $11, free_delivery_threshold = $12,
        order_prefix = $13, allow_same_day_booking = $14, booking_cutoff_time = $15,
        auto_assign_presenters = $16, updated_at = NOW()
       WHERE id = 'main';`,
      [
        businessName, body.brandTagline, body.helplinePhone, body.helplineEmail,
        body.address, body.city, body.state, body.pincode, body.currencySymbol,
        body.taxRatePercent, body.defaultDeliveryFee, body.freeDeliveryThreshold,
        body.orderPrefix, body.allowSameDayBooking, body.bookingCutoffTime,
        body.autoAssignPresenters
      ]
    );

    await logActivity(user, "Store Settings Updated", "StoreSettings", "main", "Updated store settings configuration");

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
