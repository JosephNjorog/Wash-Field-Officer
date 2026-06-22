"use client";

import { create } from "zustand";
import { NAME_COOKIE, OFFICER_COOKIE, ROLE_COOKIE, type Role, type Session } from "@/lib/auth";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

interface AuthState {
  session: Session | null;
  hydrated: boolean;
  hydrate: () => void;
  login: (session: Session) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  hydrated: false,

  hydrate: () => {
    const role = readCookie(ROLE_COOKIE) as Role | null;
    if (!role) {
      set({ session: null, hydrated: true });
      return;
    }
    set({
      session: {
        role,
        officerId: readCookie(OFFICER_COOKIE),
        name: readCookie(NAME_COOKIE) ?? "",
      },
      hydrated: true,
    });
  },

  login: (session) => {
    writeCookie(ROLE_COOKIE, session.role);
    writeCookie(NAME_COOKIE, session.name);
    if (session.officerId) writeCookie(OFFICER_COOKIE, session.officerId);
    else deleteCookie(OFFICER_COOKIE);
    set({ session, hydrated: true });
  },

  logout: () => {
    deleteCookie(ROLE_COOKIE);
    deleteCookie(OFFICER_COOKIE);
    deleteCookie(NAME_COOKIE);
    set({ session: null, hydrated: true });
  },
}));
