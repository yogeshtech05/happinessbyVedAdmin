import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("packages.view");
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const occasion = searchParams.get("occasion") || "";
    const db = await getDb();

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      whereClause += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length} OR LOWER(category) LIKE $${params.length})`;
    }

    if (occasion && occasion !== "ALL") {
      params.push(occasion);
      whereClause += ` AND occasion = $${params.length}`;
    }

    const res = await db.query(`SELECT * FROM packages ${whereClause} ORDER BY created_at DESC;`, params);

    const formattedPackages = (res.rows || []).map((row: any) => ({
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
    }));

    return NextResponse.json({ success: true, data: formattedPackages });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("packages.create");
  if (error) return error;

  try {
    const body = await req.json();
    const db = await getDb();

    const pkgId = `pkg-${Date.now()}`;
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await db.query(
      `INSERT INTO packages (
        id, slug, title, name, occasion, occasion_label, category, tagline, price,
        original_price, compare_at_price, rating, review_count, popular, featured,
        is_featured, is_active, badge, short_description, description, highlights,
        inclusions, features, addons, duration, image_theme, visual_icon, image,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, NOW(), NOW()
      );`,
      [
        pkgId,
        slug,
        body.title,
        body.name || body.title,
        body.occasion || "birthday",
        body.occasionLabel || "Birthday",
        body.category || "Milestone Celebration",
        body.tagline || "",
        body.price || 999,
        body.originalPrice || body.price || 999,
        body.compareAtPrice || body.price || 999,
        5.0,
        0,
        body.popular ?? false,
        body.featured ?? false,
        body.isFeatured ?? false,
        body.isActive ?? true,
        body.badge || "",
        body.shortDescription || "",
        body.description || "",
        JSON.stringify(body.highlights || []),
        JSON.stringify(body.inclusions || []),
        JSON.stringify(body.features || []),
        JSON.stringify(body.addons || []),
        body.duration || "30-45 Mins",
        body.imageTheme || "rose",
        body.visualIcon || "Gift",
        body.image || "/surprises/birthday.png",
      ]
    );

    await logActivity(user, "Package Created", "Package", pkgId, `Created package: ${body.title}`);

    return NextResponse.json({ success: true, data: { id: pkgId, slug } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
