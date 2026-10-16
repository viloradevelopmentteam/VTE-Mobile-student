// providers/AuthProvider.tsx

import { router, usePathname } from "expo-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/components/LoginScreen/store/useAuthStore";
import { roleAuthStore } from "@/components/LoginScreen/store/useRoleAuthStore";
import { useMeQuery, type MeResponse } from "./api/me.api";
import { usePermissionStore } from "./store/usePermissionStore";
import { useSessionStore } from "./store/useSessionStore";

import { APP_HOME, APP_SURFACE } from "@/constants/appConfig";
import { getSurface } from "@/utils/getSurface";
import { mapMeToAuthUser } from "@/utils/maperMe";
import { logoutAndDisconnect } from "./service/auth/logoutAndDisconnect";
import { loadTokens } from "./service/auth/tokenStore";

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [ready, setReady] = useState(false);
  console.log("EAUTH");
  // --------------------------------------------------
  // SESSION
  // --------------------------------------------------

  const hasToken = useSessionStore((s) => s.hasToken);
  const setHasToken = useSessionStore((s) => s.setHasToken);
  const splashFinished = useSessionStore((s) => s.splashFinished);

  // --------------------------------------------------
  // ROLE STORE
  // --------------------------------------------------

  const setRole = roleAuthStore((s) => s.setRole);
  const setIsBranchScoped = roleAuthStore((s) => s.setIsBranchScoped);
  const setBranchId = roleAuthStore((s) => s.setBranchId);
  const setActiveBranch = roleAuthStore((s) => s.setActiveBranch);
  const setAvailableRoles = roleAuthStore((s) => s.setAvailableRoles);
  const setInitializing = roleAuthStore((s) => s.setInitializing);

  // --------------------------------------------------
  // AUTH STORE
  // --------------------------------------------------

  const setUser = useAuthStore((s) => s.setUser);

  // --------------------------------------------------
  // PERMISSIONS
  // --------------------------------------------------

  const setFromMe = usePermissionStore((s) => s.setFromMe);

  const resetPermissions = usePermissionStore((s) => s.reset);

  // --------------------------------------------------
  // LOAD TOKEN
  // --------------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const token = await loadTokens();

        if (!mounted) return;

        setHasToken(Boolean(token));
      } catch {
        if (!mounted) return;

        setHasToken(false);
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // --------------------------------------------------
  // GET /user/me
  // --------------------------------------------------

  const { data: me, isError, error, isFetched } = useMeQuery(hasToken);

  // --------------------------------------------------
  // SYNC /user/me INTO STORES
  // --------------------------------------------------

  const syncFromMe = (data: MeResponse) => {
    // Permission store
    setFromMe(data);

    // Common auth user
    const authUser = mapMeToAuthUser(data);

    setUser(authUser);

    // ==================================================
    // STUDENT
    // ==================================================

    if (data.userType === "STUDENT") {
      /**
       * Student identity is now:
       *
       * userId = phone number
       *
       * One phone number can have multiple admissions.
       *
       * Therefore:
       * - no global branch
       * - no admissionId in auth store
       * - no branch selected from /user/me
       */

      setRole("STUDENT");

      // Student can have multiple branches.
      setIsBranchScoped(false);

      // Do NOT use data.courses[0].branchId here.
      setBranchId(null);
      setActiveBranch(null);

      // Students don't switch staff roles.
      setAvailableRoles([]);

      return;
    }

    // ==================================================
    // STAFF
    // ==================================================

    setRole(data.roleName);

    setIsBranchScoped(data.roleConfig?.isBranchScoped ?? true);

    setBranchId(data.branchId);
    setActiveBranch(data.branchId);

    setAvailableRoles("availableRoles" in data ? data.availableRoles : []);
  };

  // --------------------------------------------------
  // AUTH ERROR
  // --------------------------------------------------

  useEffect(() => {
    const status = (error as any)?.response?.status;

    if (isError && (status === 401 || status === 403)) {
      logoutAndDisconnect();
    }
  }, [isError, error]);

  // --------------------------------------------------
  // AUTH INITIALIZATION / ROUTING
  // --------------------------------------------------

  useEffect(() => {
    console.log("[AUTH ROUTING]", {
      ready,
      splashFinished,
      hasToken,
      isFetched,
      isError,
      me: !!me,
      pathname,
    });

    if (!ready || !splashFinished) {
      console.log("[AUTH] waiting for ready/splash");
      return;
    }

    if (!hasToken) {
      console.log("[AUTH] NO TOKEN -> LOGIN");

      setRole(null);
      setIsBranchScoped(true);
      setBranchId(null);
      setActiveBranch(null);
      setAvailableRoles([]);

      setUser(null);
      resetPermissions();

      setInitializing(false);

      router.replace("/login");
      return;
    }

    if (!isFetched) {
      console.log("[AUTH] TOKEN EXISTS -> waiting for /me");
      return;
    }
    if (isError || !me) {
      console.log("[AUTH] /me FAILED -> clearing session");

      logoutAndDisconnect();

      setHasToken(false);
      setRole(null);
      setIsBranchScoped(true);
      setBranchId(null);
      setActiveBranch(null);
      setAvailableRoles([]);

      setUser(null);
      resetPermissions();

      setInitializing(false);

      router.replace("/login");

      setInitializing(false);

      router.replace("/login");
      return;
    }

    console.log("[AUTH] /me SUCCESS");

    syncFromMe(me);

    const surface =
      me.userType === "STUDENT" ? "student" : getSurface(me.roleName);

    console.log("[AUTH] surface:", surface, "app:", APP_SURFACE);

    // This build only serves one audience. An account from the other audience
    // is signed out here instead of landing on a screen it cannot use.
    if (surface !== APP_SURFACE) {
      console.log("[AUTH] account belongs to the other app -> signing out");
      logoutAndDisconnect();
      setInitializing(false);
      return;
    }

    setInitializing(false);

    if (pathname === "/" || pathname === "/login") {
      router.replace(APP_HOME);
    }
  }, [ready, splashFinished, hasToken, isFetched, isError, me, pathname]);

  return <>{children}</>;
}
