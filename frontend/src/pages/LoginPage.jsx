import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://queueless-india-a2ju.onrender.com/api";

function LoginPage({ setSession, session }) {
  const navigate = useNavigate();

  // ======================================================
  // LOGIN FORM
  // ======================================================

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "USER",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ======================================================
  // REDIRECT IF ALREADY LOGGED IN
  // ======================================================

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  // ======================================================
  // HANDLE INPUT CHANGE
  // ======================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    // Clear previous error when user changes input
    if (error) {
      setError("");
    }
  };

  // ======================================================
  // HANDLE ROLE CHANGE
  // ======================================================

  const handleRoleChange = (event) => {
    const selectedRole = event.target.value;

    setForm((current) => ({
      ...current,
      role: selectedRole,
    }));

    setError("");
  };

  // ======================================================
  // HANDLE LOGIN
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear old error
    setError("");

    // Validate username
    if (!form.username.trim()) {
      setError("Please enter your username.");
      return;
    }

    // Validate password
    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          role: form.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ==================================================
      // CREATE SESSION
      // ==================================================

      const nextSession = {
        token: data.token,
        userId: data.user._id,
        name: data.user.name,
        username: data.user.username,
        role: data.user.role,
        hospitalId: data.user.hospitalId || null,
        officeId: data.user.officeId || null,
      };

      setSession(nextSession);

      // ==================================================
      // ROLE-BASED REDIRECT
      // ==================================================

      const normalizedRole =
        data.user.role?.trim().toUpperCase();

      if (normalizedRole === "ADMIN") {
        navigate("/admin");
      } else if (normalizedRole === "HOSPITAL") {
        navigate("/hospital-dashboard");
      } else if (
        normalizedRole === "GOVERNMENT OFFICE"
      ) {
        navigate("/office-dashboard");
      } else {
        // USER
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // GO TO REGISTER
  // ======================================================

  const handleSignUp = () => {
    navigate("/register");
  };

  // ======================================================
  // LOGIN PAGE
  // ======================================================

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">

      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

        {/* ================================================
            HEADER
        ================================================= */}

        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
          Access Portal
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          QueueLess India Login
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Login to access your QueueLess India account.
        </p>

        {/* ================================================
            LOGIN FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >

          {/* USERNAME */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              autoComplete="username"
            />
          </div>

          {/* PASSWORD */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              autoComplete="current-password"
            />
          </div>

          {/* ROLE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Role
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handleRoleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="USER">
                USER
              </option>

              <option value="HOSPITAL">
                HOSPITAL
              </option>

              <option value="GOVERNMENT OFFICE">
                GOVERNMENT OFFICE
              </option>

              <option value="ADMIN">
                ADMIN
              </option>
            </select>
          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-700 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          {/* ================================================
              SIGN UP - USER ONLY
          ================================================= */}

          {form.role === "USER" && (
            <div className="mt-6 text-center text-sm text-slate-600">
              Don't have an account?{" "}

              <button
                type="button"
                onClick={handleSignUp}
                className="font-semibold text-blue-700 hover:text-blue-800"
              >
                Sign Up
              </button>
            </div>
          )}

        </form>
      </div>
    </main>
  );
}

export default LoginPage;