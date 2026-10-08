import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const { user, error } = await requireAuthAndPermission("content.view");
  if (error) return error;

  try {
    const db = await getDb();
    const res = await db.query("SELECT * FROM cms_content ORDER BY updated_at DESC;");

    const items = (res.rows || []).map((row: any) => ({
      id: row.id,
      sectionKey: row.section_key,
      title: row.title,
      subtitle: row.subtitle,
      content: row.content,
      imageUrl: row.image_url,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      updatedBy: row.updated_by,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("content.update");
  if (error) return error;

  try {
    const body = await req.json();
    const db = await getDb();

    await db.query(
      `UPDATE cms_content 
       SET title = $1, subtitle = $2, content = $3, image_url = $4, updated_by = $5, updated_at = NOW()
       WHERE section_key = $6;`,
      [body.title, body.subtitle || "", body.content, body.imageUrl || "", user.name, body.sectionKey]
    );

    await logActivity(user, "CMS Content Updated", "CMSContent", body.sectionKey, `Updated CMS section ${body.sectionKey}`);

    return NextResponse.json({ success: true, message: "CMS Content updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
