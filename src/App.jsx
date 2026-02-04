import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// temp placeholders until we build them
function Placeholder({ title }) {
  return <div className="p-6">{title}</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/leads" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <Placeholder title="Leads page (next)" />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<div className="p-6">Not found</div>} />
    </Routes>
  );
}