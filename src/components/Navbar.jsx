import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link to="/leads" className="font-semibold">
          CRM
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <Link className="text-sm hover:underline" to="/leads">
              Leads
            </Link>
            <Link className="text-sm hover:underline" to="/contacts">
              Contacts
            </Link>
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
              onClick={() => {
                logout();
                nav("/login");
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link className="text-sm hover:underline" to="/login">
              Login
            </Link>
            <Link className="text-sm hover:underline" to="/signup">
              Signup
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}