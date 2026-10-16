import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(redirectTimer.current), []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await register(name, email, password);

      setSuccess("Registration successful. Redirecting to login...");

      redirectTimer.current = window.setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page card">
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            minLength={2}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit" disabled={loading || !!success}>
          {loading ? "Creating..." : "Register"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
