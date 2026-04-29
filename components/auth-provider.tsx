import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { fetchCurrentUserProfile, signInWithAccess, signOutCurrentUser, type AppUserProfile, type AuthResult } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const AUTH_BOOT_TIMEOUT_MS = 4000;
const PROFILE_LOAD_RETRIES = 3;
const PROFILE_RETRY_DELAY_MS = 250;
const AUTH_DEBUG_PREFIX = "[auth]";

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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function debugAuth(message: string, payload?: Record<string, unknown>) {
  if (payload) {
    console.log(AUTH_DEBUG_PREFIX, message, payload);
    return;
  }
  console.log(AUTH_DEBUG_PREFIX, message);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const sessionRef = useRef<Session | null>(null);
  const profileRef = useRef<AppUserProfile | null>(null);
  const pendingProfileRef = useRef<AppUserProfile | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  async function loadProfile(userId: string, options?: { preserveExisting?: boolean }) {
    const preserveExisting = options?.preserveExisting ?? false;
    const existingProfile = profileRef.current;

    for (let attempt = 0; attempt < PROFILE_LOAD_RETRIES; attempt += 1) {
      try {
        const { data, error } = await withTimeout(fetchCurrentUserProfile(userId), AUTH_BOOT_TIMEOUT_MS, "profile_load");
        if (!error && data) {
          debugAuth("profile_loaded", { userId, role: data.role, status: data.status, attempt: attempt + 1 });
          setProfile(data);
          setProfileReady(true);
          return data;
        }
        debugAuth("profile_missing_retry", { userId, attempt: attempt + 1, hasError: Boolean(error) });
      } catch {
        debugAuth("profile_load_error_retry", { userId, attempt: attempt + 1 });
      }

      if (attempt < PROFILE_LOAD_RETRIES - 1) {
        await delay(PROFILE_RETRY_DELAY_MS);
      }
    }

    if (preserveExisting && existingProfile?.id === userId) {
      debugAuth("profile_preserved_from_memory", { userId, role: existingProfile.role, status: existingProfile.status });
      setProfile(existingProfile);
      setProfileReady(true);
      return existingProfile;
    }

    debugAuth("profile_unavailable_after_retries", { userId });
    setProfile(null);
    setProfileReady(true);
    return null;
  }

  async function signIn(email: string, password: string) {
    debugAuth("sign_in_started", { email: email.trim().toLowerCase() });
    setSessionReady(false);
    setProfileReady(false);

    const result = await signInWithAccess(email, password);

    if (!result.ok) {
      debugAuth("sign_in_failed", { email: email.trim().toLowerCase(), code: result.code });
      pendingProfileRef.current = null;
      setSession(null);
      setProfile(null);
      setSessionReady(true);
      setProfileReady(true);
      return result;
    }

    pendingProfileRef.current = result.profile;
    debugAuth("sign_in_succeeded", {
      userId: result.session.user.id,
      role: result.profile.role,
      status: result.profile.status,
    });
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
        debugAuth("boot_session_loaded", { hasSession: Boolean(data.session), userId: data.session?.user.id ?? null });
        if (data.session?.user.id) {
          setProfileReady(false);
          setSession(data.session);
          setSessionReady(true);
          await loadProfile(data.session.user.id, { preserveExisting: true });
        } else {
          setSession(null);
          setSessionReady(true);
          setProfile(null);
          setProfileReady(true);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setSessionReady(true);
        setProfileReady(true);
      });

    const { data } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!mounted) return;
      debugAuth("auth_state_changed", {
        event,
        hasSession: Boolean(nextSession),
        userId: nextSession?.user.id ?? null,
      });
      if (nextSession?.user.id) {
        setProfileReady(false);
        setSession(nextSession);
        setSessionReady(true);
        const pendingProfile = pendingProfileRef.current;
        if (pendingProfile?.id === nextSession.user.id) {
          debugAuth("auth_state_uses_pending_profile", {
            event,
            userId: nextSession.user.id,
            role: pendingProfile.role,
          });
          pendingProfileRef.current = null;
          setProfile(pendingProfile);
          setProfileReady(true);
          return;
        }

        const currentProfile = profileRef.current;
        const currentSession = sessionRef.current;
        const sameUserProfile =
          currentProfile?.id === nextSession.user.id &&
          currentSession?.user.id === nextSession.user.id;

        if (sameUserProfile) {
          debugAuth("auth_state_keeps_existing_profile", { event, userId: nextSession.user.id });
          setProfileReady(true);
          return;
        }

        await loadProfile(nextSession.user.id, { preserveExisting: true });
      } else {
        setSession(null);
        setSessionReady(true);
        pendingProfileRef.current = null;
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
      debugAuth("sign_out_due_to_invalid_profile", {
        userId: session.user.id,
        hasProfile: Boolean(profile),
        status: profile?.status ?? null,
      });
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
