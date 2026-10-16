import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="page card">
      <h1>User Dashboard</h1>

      <h2>Welcome, {user?.name}</h2>

      <p>Email: {user?.email}</p>

      <p>Role: {user?.role}</p>

      {/* UI convenience only; the backend enforces ADMIN on /api/admin */}
      {user?.role === "ADMIN" && (
        <p>
          <Link to="/admin">Go to Admin Dashboard</Link>
        </p>
      )}

      <button onClick={logout}>Logout</button>
    </div>
  );
}
