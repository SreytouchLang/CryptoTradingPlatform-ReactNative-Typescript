// src/auth/useLogout.ts
import { clearToken } from "./tokenStorage";
import { useAuthStore } from "./authStore";

/**
 * Usage:
 *   const logout = useLogout();
 *   <Pressable onPress={logout}>...</Pressable>
 */
export function useLogout() {
    const setToken = useAuthStore((s) => s.setToken);

    return async function logout() {
        await clearToken();
        setToken(null); // ✅ triggers navigator to show Login
    };
}