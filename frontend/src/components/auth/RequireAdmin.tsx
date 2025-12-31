// src/components/auth/RequireAdmin.tsx
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAdmin({
  children,
}: {
  children: JSX.Element;
}) {
  const token = localStorage.getItem("access");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
