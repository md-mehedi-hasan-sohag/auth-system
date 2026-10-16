import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import type { UserRole } from "../types/auth";

interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: number;
  created_at: string;
}

export default function AdminDashboard() {
  const { logout } = useAuth();

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/users`, {
          credentials: "include",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Failed to load users");
        }

        setUsers(data.users);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load users"
        );
      }
    };

    loadUsers();
  }, []);

  return (
    <div className="page wide">
      <h1>Admin Dashboard</h1>

      <p>
        <Link to="/dashboard">Back to Dashboard</Link>
      </p>

      <button onClick={logout}>Logout</button>

      {error && <p className="error">{error}</p>}

      <h2>Users</h2>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.is_active ? "Active" : "Disabled"}</td>
                <td>{new Date(user.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
