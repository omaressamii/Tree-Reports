import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import SalesReport from "./pages/SalesReport";
import PurchasesReport from "./pages/PurchasesReport";
import StockReport from "./pages/StockReport";
import Login from "./pages/Login";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem('user');
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Logout = () => {
  React.useEffect(() => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  }, []);
  return null;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Home />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/sales/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="summary" element={<SalesReport />} />
                  <Route path="detailed" element={<SalesReport />} />
                  <Route path="hourly" element={<SalesReport />} />
                  <Route path="*" element={<Navigate to="summary" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/purchases/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="summary" element={<PurchasesReport />} />
                  <Route path="returns" element={<PurchasesReport />} />
                  <Route path="*" element={<Navigate to="summary" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="balance" element={<StockReport />} />
                  <Route path="valuation" element={<StockReport />} />
                  <Route path="*" element={<Navigate to="balance" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
