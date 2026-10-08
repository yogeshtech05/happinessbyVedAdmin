import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("reviews.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();
    const db = await getDb();

    await db.query(
      `UPDATE reviews SET status = $1, is_featured = $2 WHERE id = $3;`,
      [body.status, body.isFeatured, id]
    );

    await logActivity(user, "Review Moderated", "Review", id, `Review ${id} status set to ${body.status}`);

    return NextResponse.json({ success: true, message: "Review updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuthAndPermission("reviews.delete");
  if (error) return error;

  try {
    const { id } = await params;
    const db = await getDb();

    await db.query("DELETE FROM reviews WHERE id = $1;", [id]);
    await logActivity(user, "Review Deleted", "Review", id, `Deleted review ID ${id}`);

    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
