import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/auth.store";
import { LoginScreen } from "./screens/LoginScreen";
import { MapScreen } from "./screens/MapScreen";
import { UnitScreen } from "./screens/UnitScreen";

function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <MapScreen />
          </RequireAuth>
        }
      />
      <Route
        path="/unit/:id"
        element={
          <RequireAuth>
            <UnitScreen />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
