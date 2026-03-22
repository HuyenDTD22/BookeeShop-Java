import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { adminRoutes } from "./routes/adminRoutes";
import { clientAuthRoutes, clientRoutes } from "./routes/clientRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { ClientAuthProvider } from "./contexts/ClientAuthContext";
import AdminLayoutComponent from "./components/admin/layout/AdminLayoutComponent";
import ProtectedRouteComponent from "./components/admin/layout/ProtectedRouteComponent";
import ClientLayout from "./components/client/layout/ClientLayout";
import NotFoundPage from "./pages/client/error/NotFoundPage";
import "./styles/globals.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

function App() {
  return (
    <Router>
      <Routes>
        {/* ══ CLIENT AUTH ROUTES (no layout) ═════════════════════ */}
        {clientAuthRoutes.map(({ path, page: Page }) => (
          <Route
            key={path}
            path={path}
            element={
              <ClientAuthProvider>
                <Page />
              </ClientAuthProvider>
            }
          />
        ))}

        {/* ══ CLIENT ROUTES (with layout) ════════════════════════ */}
        {clientRoutes.map(({ path, page: Page }) => (
          <Route
            key={path}
            path={path}
            element={
              <ClientAuthProvider>
                <ClientLayout>
                  <Page />
                </ClientLayout>
              </ClientAuthProvider>
            }
          />
        ))}

        {/* ══ ADMIN ROUTES ════════════════════════════════════════ */}
        {adminRoutes.map(({ path, page: Page, isAdmin }) => {
          if (isAdmin) {
            return (
              <Route
                key={path}
                path={path}
                element={
                  <AuthProvider>
                    <ProtectedRouteComponent>
                      <AdminLayoutComponent>
                        <Page />
                      </AdminLayoutComponent>
                    </ProtectedRouteComponent>
                  </AuthProvider>
                }
              />
            );
          }
          return (
            <Route
              key={path}
              path={path}
              element={
                <AuthProvider>
                  <Page />
                </AuthProvider>
              }
            />
          );
        })}

        {/* ══ 404 — bắt tất cả path không khớp ══════════════════ */}
        <Route
          path="*"
          element={
            <ClientAuthProvider>
              <ClientLayout>
                <NotFoundPage />
              </ClientLayout>
            </ClientAuthProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
