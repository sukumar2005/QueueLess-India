
import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ session, allowedRoles = [] }) {
  const location = useLocation();

  // User is not logged in
  if (!session) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  const role = session?.role?.trim().toUpperCase();

  // Any authenticated role can access
  if (allowedRoles.length === 0) {
    return <Outlet />;
  }

  const normalizedRoles = allowedRoles.map((item) =>
    item.trim().toUpperCase()
  );

  // Admin can access everything
  if (role === "ADMIN") {
    return <Outlet />;
  }

  // Check user's role
  if (normalizedRoles.includes(role)) {
    return <Outlet />;
  }

  // Unauthorized role
  return <Navigate to="/" replace />;
}

export default ProtectedRoute;