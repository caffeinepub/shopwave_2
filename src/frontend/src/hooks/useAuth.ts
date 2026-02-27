import { useEffect } from "react";
import { useInternetIdentity } from "./useInternetIdentity";
import { useActor } from "./useActor";
import { UserRole } from "../backend.d";

export function useAuth() {
  const { identity, login, clear, isInitializing } = useInternetIdentity();
  const { actor } = useActor();

  const principal = identity?.getPrincipal();
  const isLoggedIn = !!identity && !!principal && !principal.isAnonymous();

  // When a real (non-anonymous) identity is available, assign the user role
  useEffect(() => {
    if (!isLoggedIn || !actor || !principal) return;
    void actor.assignCallerUserRole(principal, UserRole.user).catch(() => {
      // Best-effort — don't surface errors to the user
    });
  }, [isLoggedIn, actor, principal]);

  return {
    isLoggedIn,
    identity,
    login,
    logout: clear,
    principal,
    isInitializing,
  };
}
