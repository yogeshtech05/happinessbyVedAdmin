const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; total?: number }> {
  try {
    const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    };

    const res = await fetch(url, config);
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.error || `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    return json;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network error. Please check backend server.",
    };
  }
}
