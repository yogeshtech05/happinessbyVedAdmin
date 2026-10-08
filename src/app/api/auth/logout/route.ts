import { NextResponse } from "next/server";
import { removeAuthCookie, getCurrentAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";

export async function POST() {
  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin) {
    await logActivity(
      currentAdmin,
      "Admin Logout",
      "AdminUser",
      currentAdmin.id,
      `Admin logged out (${currentAdmin.email})`
    );
  }

  await removeAuthCookie();
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
