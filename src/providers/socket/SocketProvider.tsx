
import { useEffect, useRef } from "react";
import { roleAuthStore } from "@/components/LoginScreen/store/useRoleAuthStore";
import { getSurface } from "@/utils/getSurface";
import { useAuthStore } from "@/components/LoginScreen/store/useAuthStore";
import { useSessionStore } from "../store/useSessionStore";
import { initHandler } from "./event.socket";

export const SocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const hasToken = useSessionStore((s) => s.hasToken);
  const isInitializing = roleAuthStore((s) => s.initializing);
  const role = roleAuthStore((s) => s.role);
  const branchId = roleAuthStore((s) => s.branchId);
  const user = useAuthStore((s) => s.user);

  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    // Never initialize sockets for logged-out or incomplete sessions.
    if (
      isInitializing ||
      !hasToken ||
      !role ||
      !user?.id
    ) {
      lastKey.current = null;
      return;
    }

    const surface = getSurface(role);
    const key = `${surface}_${user.id}_${branchId ?? ""}`;

    if (lastKey.current === key) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const connect = async () => {
      try {
        const disconnect = await initHandler(
          surface,
          String(user.id),
          branchId != null ? String(branchId) : null
        );

        if (cancelled) {
          disconnect?.();
          return;
        }

        cleanup = disconnect;
        lastKey.current = key;
      } catch (error) {
        console.error("[SOCKET] Initialization failed:", error);
        lastKey.current = null;
      }
    };

    void connect();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [isInitializing, hasToken, role, branchId, user?.id]);

  return <>{children}</>;
};
