import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireAuthAndPermission } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const { user, error } = await requireAuthAndPermission("notifications.view");
  if (error) return error;

  try {
    const db = await getDb();
    const res = await db.query("SELECT * FROM notifications ORDER BY created_at DESC;");

    const notifications = (res.rows || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      targetAudience: row.target_audience,
      recipientId: row.recipient_id,
      sentBy: row.sent_by,
      status: row.status,
      sentAt: row.sent_at,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, data: notifications });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuthAndPermission("notifications.send");
  if (error) return error;

  try {
    const body = await req.json();
    const db = await getDb();

    const notifId = `notif-${Date.now()}`;
    await db.query(
      `INSERT INTO notifications (id, title, body, target_audience, recipient_id, sent_by, status, sent_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'SENT', NOW(), NOW());`,
      [notifId, body.title, body.body, body.targetAudience || "ALL_CUSTOMERS", body.recipientId || null, user.name]
    );

    await logActivity(user, "Notification Broadcast", "Notification", notifId, `Sent notification: ${body.title}`);

    return NextResponse.json({ success: true, data: { id: notifId } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
