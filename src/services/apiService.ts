export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; total?: number }> {
  try {
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    };

    const res = await fetch(endpoint, config);
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
