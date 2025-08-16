import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import InchargeDashboard from "./pages/incharge/InchargeDashboard";
import InchargeFiles from "./pages/admin/InchargeFiles";
import MyFiles from "./pages/incharge/MyFiles";
import "./styles.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute allow={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/incharges/:id" element={<InchargeFiles />} />
          </Route>

          <Route element={<ProtectedRoute allow={["incharge"]} />}>
            <Route path="/incharge/dashboard" element={<InchargeDashboard />} />
            <Route path="/incharge/files" element={<MyFiles />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
