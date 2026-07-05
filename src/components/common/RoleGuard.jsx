import { useAuth } from "../../context/AuthContext";

export function RoleGuard({ children, allowedRoles, fallback = null }) {
  const { hasRole } = useAuth();

  const DEV_BYPASS = false;
  if (DEV_BYPASS) {
    return <>{children}</>;
  }
  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
