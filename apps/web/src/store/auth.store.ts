import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PublicUser } from "@tense-lab/shared";

interface AuthState {
  token: string | null;
  user: PublicUser | null;
  setSession: (token: string, user: PublicUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "tense-lab-auth" },
  ),
);
