import type { AnalysisRequest, AnalysisResponse, AuthResponse, BuildableSentence, PublicUser, Unit } from "@tense-lab/shared";
import { useAuthStore } from "../store/auth.store";

const BASE = "/api";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor.", 0);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    const message = Array.isArray(body.message) ? body.message.join(", ") : (body.message ?? res.statusText);
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}

export const api = {
  register: (email: string, password: string, name: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<PublicUser>("/auth/me"),
  getUnits: () => request<Unit[]>("/content/units"),
  getUnit: (id: string) => request<Unit>(`/content/units/${encodeURIComponent(id)}`),
  analyze: (body: AnalysisRequest) =>
    request<AnalysisResponse>("/analysis", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  generateSentence: (unitId: string, avoid: string[]) =>
    request<BuildableSentence>(`/practice/units/${unitId}/sentences/generate`, {
      method: "POST",
      body: JSON.stringify({ avoid }),
    }),
};
