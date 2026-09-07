export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN';
}

const AUTH_STORAGE_KEY = 'sdbinanusa_admin_session_v1';

export class AdminAuth {
  static getSession(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static getCurrentUser(): AdminUser | null {
    return this.getSession();
  }

  static login(email: string, password: string): { success: boolean; error?: string; user?: AdminUser } {
    const cleanEmail = email.trim().toLowerCase();
    // ponytail: client-side auth only — ceiling = demo/prototype. Upgrade to server session (NextAuth/HTTP-only cookie + API guard) for production.
    const allowedEmails = ['admin@binanusa.sch.id', 'admin@arrafah.sch.id', 'panitia@binanusa.sch.id'];
    if (allowedEmails.includes(cleanEmail) && password === 'admin123') {
      const user: AdminUser = {
        id: 'admin-001',
        email: cleanEmail,
        name: 'Panitia SPMB SD Bina Nusa',
        role: 'ADMIN',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      }
      return { success: true, user };
    }

    return {
      success: false,
      error: 'Kombinasi email atau password salah. Gunakan default: admin@binanusa.sch.id / admin123',
    };
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }
}
