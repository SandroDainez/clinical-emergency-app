import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

import { fetchCurrentUserProfile, signInWithAccess, signOutCurrentUser, type AppUserProfile, type AuthResult } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const AUTH_BOOT_TIMEOUT_MS = 4000;

type AuthContextValue = {
  session: Session | null;
  profile: AppUserProfile | null;
  isReady: boolean;
  isAdmin: boolean;
  canAccessApp: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`${label}_timeout`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);

  async function loadProfile(userId: string) {
    try {
      const { data } = await withTimeout(fetchCurrentUserProfile(userId), AUTH_BOOT_TIMEOUT_MS, "profile_load");
      setProfile(data);
      return data;
    } catch {
      setProfile(null);
      return null;
    } finally {
      setProfileReady(true);
    }
  }

  async function signIn(email: string, password: string) {
    setSessionReady(false);
    setProfileReady(false);

    const result = await signInWithAccess(email, password);

    if (!result.ok) {
      setSession(null);
      setProfile(null);
      setSessionReady(true);
      setProfileReady(true);
      return result;
    }

    setSession(result.session);
    setProfile(result.profile);
    setSessionReady(true);
    setProfileReady(true);
    return result;
  }

  useEffect(() => {
    if (!supabase) {
      setSessionReady(true);
      setProfileReady(true);
      return;
    }

    let mounted = true;

    withTimeout(supabase.auth.getSession(), AUTH_BOOT_TIMEOUT_MS, "session_load")
      .then(async ({ data }) => {
        if (!mounted) return;
        setSession(data.session ?? null);
        setSessionReady(true);
        if (data.session?.user.id) {
          await loadProfile(data.session.user.id);
        } else {
          setProfile(null);
          setProfileReady(true);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setSessionReady(true);
        setProfileReady(true);
      });

    const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession ?? null);
      setSessionReady(true);
      if (nextSession?.user.id) {
        setProfileReady(false);
        await loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
        setProfileReady(true);
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionReady || !profileReady || !session) return;
    if (!profile || profile.status !== "ativo") {
      void signOutCurrentUser();
    }
  }, [profile, profileReady, session, sessionReady]);

  const value: AuthContextValue = {
    session,
    profile,
    isReady: sessionReady && profileReady,
    isAdmin: Boolean(profile && profile.status === "ativo" && profile.role === "admin"),
    canAccessApp: Boolean(session && profile && profile.status === "ativo"),
    signIn,
    refreshProfile: async () => {
      if (!session?.user.id) return;
      setProfileReady(false);
      await loadProfile(session.user.id);
    },
    signOut: signOutCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
