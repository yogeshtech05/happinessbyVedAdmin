import { NextResponse } from "next/server";
import { getCurrentAdmin } from "./auth";
import { AdminUser } from "@/types";

export function hasPermission(user: AdminUser | null, requiredCode: string): boolean {
  if (!user) return false;
  if (user.roleName === "Super Admin") return true;
  return user.permissions?.includes(requiredCode) ?? false;
}

export async function requireAuthAndPermission(requiredCode?: string): Promise<
  { user: AdminUser; error: null } | { user: null; error: NextResponse }
> {
  const user = await getCurrentAdmin();

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: "Unauthorized access. Please log in." },
        { status: 401 }
      ),
    };
  }

  if (requiredCode && !hasPermission(user, requiredCode)) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: `Forbidden. Required permission: ${requiredCode}` },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}
