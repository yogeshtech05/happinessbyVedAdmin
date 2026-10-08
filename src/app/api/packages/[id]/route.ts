import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("packages.view");
  if (error) return error;

  try {
    const { id } = await params;
    const db = await getDb();
    const res = await db.query("SELECT * FROM packages WHERE id = $1 OR slug = $1;", [id]);

    if (!res.rows || res.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 });
    }

    const row = res.rows[0];
    const pkg = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      name: row.name,
      occasion: row.occasion,
      occasionLabel: row.occasion_label,
      category: row.category,
      tagline: row.tagline,
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
      compareAtPrice: row.compare_at_price ? parseFloat(row.compare_at_price) : undefined,
      rating: parseFloat(row.rating || "5.0"),
      reviewCount: row.review_count,
      popular: row.popular,
      featured: row.featured,
      isFeatured: row.is_featured,
      isActive: row.is_active,
      badge: row.badge,
      shortDescription: row.short_description,
      description: row.description,
      highlights: typeof row.highlights === "string" ? JSON.parse(row.highlights) : row.highlights || [],
      inclusions: typeof row.inclusions === "string" ? JSON.parse(row.inclusions) : row.inclusions || [],
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
      addons: typeof row.addons === "string" ? JSON.parse(row.addons) : row.addons || [],
      duration: row.duration,
      imageTheme: row.image_theme,
      visualIcon: row.visual_icon,
      image: row.image,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return NextResponse.json({ success: true, data: pkg });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("packages.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();
    const db = await getDb();

    const existingRes = await db.query("SELECT * FROM packages WHERE id = $1;", [id]);
    if (!existingRes.rows || existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 });
    }

    const row = existingRes.rows[0];

    await db.query(
      `UPDATE packages SET
        title = $1, name = $2, occasion = $3, occasion_label = $4, category = $5, tagline = $6,
        price = $7, original_price = $8, compare_at_price = $9, popular = $10, featured = $11,
        is_featured = $12, is_active = $13, badge = $14, short_description = $15, description = $16,
        highlights = $17, inclusions = $18, features = $19, addons = $20, duration = $21,
        image_theme = $22, visual_icon = $23, image = $24, updated_at = NOW()
       WHERE id = $25;`,
      [
        body.title ?? row.title,
        body.name ?? row.name,
        body.occasion ?? row.occasion,
        body.occasionLabel ?? row.occasion_label,
        body.category ?? row.category,
        body.tagline ?? row.tagline,
        body.price ?? row.price,
        body.originalPrice ?? row.original_price,
        body.compareAtPrice ?? row.compare_at_price,
        body.popular ?? row.popular,
        body.featured ?? row.featured,
        body.isFeatured ?? row.is_featured,
        body.isActive ?? row.is_active,
        body.badge ?? row.badge,
        body.shortDescription ?? row.short_description,
        body.description ?? row.description,
        JSON.stringify(body.highlights ?? (typeof row.highlights === "string" ? JSON.parse(row.highlights) : row.highlights)),
        JSON.stringify(body.inclusions ?? (typeof row.inclusions === "string" ? JSON.parse(row.inclusions) : row.inclusions)),
        JSON.stringify(body.features ?? (typeof row.features === "string" ? JSON.parse(row.features) : row.features)),
        JSON.stringify(body.addons ?? (typeof row.addons === "string" ? JSON.parse(row.addons) : row.addons)),
        body.duration ?? row.duration,
        body.imageTheme ?? row.image_theme,
        body.visualIcon ?? row.visual_icon,
        body.image ?? row.image,
        id,
      ]
    );

    await logActivity(user, "Package Updated", "Package", id, `Updated package ${body.title || row.title}`);

    return NextResponse.json({ success: true, message: "Package updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("packages.delete");
  if (error) return error;

  try {
    const { id } = await params;
    const db = await getDb();

    await db.query("DELETE FROM packages WHERE id = $1;", [id]);
    await logActivity(user, "Package Deleted", "Package", id, `Deleted package ${id}`);

    return NextResponse.json({ success: true, message: "Package deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
