// Edge-safe — no node:crypto. Only the cookie name + helpers that don't need crypto.
// Full HMAC verify lives in lib/auth/server.ts (Node runtime, Route Handlers).
export const ADMIN_COOKIE_NAME = 'spmb_admin_session';
