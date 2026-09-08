export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN';
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    credentials: 'include',
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (body as { error?: string }).error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body as T;
}

export class AdminAuth {
  static async getSession(): Promise<AdminUser | null> {
    if (typeof window === 'undefined') return null;
    try {
      const data = await fetchJson<{ user: AdminUser | null }>('/api/admin/login', { method: 'GET' });
      return data.user;
    } catch {
      return null;
    }
  }

  static async getCurrentUser(): Promise<AdminUser | null> {
    return this.getSession();
  }

  static async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
    try {
      const data = await fetchJson<{ user: AdminUser }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      return { success: true, user: data.user };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login gagal.';
      return { success: false, error: msg };
    }
  }

  static async logout(): Promise<void> {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const s = await this.getSession();
    return s !== null;
  }
}
