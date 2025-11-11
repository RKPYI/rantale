/**
 * @deprecated This file is kept for backward compatibility.
 * Please import from @/contexts/auth-context instead.
 *
 * Auth is now context-based for better performance and state sharing.
 * All components using useAuth will receive the same auth state instance.
 */

export { useAuth } from "@/contexts/auth-context";
