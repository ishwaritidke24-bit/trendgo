export interface AuthUser {
  id: string;
  name: string;
  email: string;
  location: string;
  interests: string[];
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  success: boolean;
  user: AuthUser;
  error?: { message?: string; details?: Array<{ field: string; message: string }> };
}

interface BasicResponse {
  success: boolean;
  error?: { message?: string; details?: Array<{ field: string; message: string }> };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

async function authRequest<T extends AuthResponse>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  const payload = (await response.json()) as T;
  if (!response.ok) {
    const validationMessage = payload.error?.details?.map((item) => item.message).join(" ");
    throw new Error(validationMessage || payload.error?.message || "Something went wrong. Please try again.");
  }
  return payload;
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Unable to verify your session");
  const payload = (await response.json()) as AuthResponse;
  return payload.user;
}

export async function signUp(input: { name: string; email: string; password: string }) {
  const payload = await authRequest<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(input) });
  return payload.user;
}

export async function signIn(input: { email: string; password: string }) {
  const payload = await authRequest<AuthResponse>("/auth/signin", { method: "POST", body: JSON.stringify(input) });
  return payload.user;
}

export async function signOut() {
  await authRequest<BasicResponse>("/auth/signout", { method: "POST" });
}
