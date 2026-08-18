import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Bot,
  Building2,
  FileText,
  Hospital,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";

import LiveQueue from "./pages/LiveQueue";
import OfficerDashboard from "./pages/OfficerDashboard";
import { QueueProvider } from "./context/QueueContext";
import AdminDashboard from "./pages/AdminDashboard";
import TokenPage from "./pages/TokenPage";
import Hospitals from "./pages/Hospitals";
import GovernmentOffices from "./pages/GovernmentOffices";
import Documents from "./pages/Documents";
import AiAssistant from "./pages/AiAssistant";
import HospitalLiveQueue from "./pages/HospitalLiveQueue";
import HospitalDashboard from "./pages/HospitalDashboard";
import OfficeLiveQueue from "./pages/OfficeLiveQueue";
import OfficeDashboard from "./pages/OfficeDashboard";

const API_URL = import.meta.env.VITE_API_URL || "https://queueless-india-a2ju.onrender.com/api";

const getStoredSession = () => {
  try {
    const raw = localStorage.getItem("queueless_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

function App() {
  const [session, setSession] = useState(getStoredSession);

  useEffect(() => {
    if (session) {
      localStorage.setItem("queueless_session", JSON.stringify(session));
    } else {
      localStorage.removeItem("queueless_session");
    }
  }, [session]);

  const logout = () => setSession(null);

  return (
    <QueueProvider>
      <BrowserRouter>
        <AppShell session={session} setSession={setSession} logout={logout} />
      </BrowserRouter>
    </QueueProvider>
  );
}

function AppShell({ session, setSession, logout }) {
  const navigate = useNavigate();
  const role = session?.role;
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const hasUserAccess = role === "USER" || !role;
  const hasHospitalAccess = role === "HOSPITAL" || role === "ADMIN";
  const hasOfficeAccess = role === "GOVERNMENT OFFICE" || role === "ADMIN";

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/notifications`);

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };

    loadNotifications();

    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markRead = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
      });

      setNotifications((current) =>
        current.map((item) =>
          item._id === id ? { ...item, read: true } : item
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 font-bold text-white">
              Q
            </div>
            <div>
              <p className="font-bold">QueueLess India</p>
              <p className="text-xs text-slate-500">Public Service Platform</p>
            </div>
          </Link>

          <div className="flex items-center gap-5">
            <Link to="/services" className="text-sm font-semibold text-slate-600 hover:text-blue-700">
              Find Service
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((current) => !current)}
                className="relative rounded-full border border-slate-200 p-2 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="mb-2 flex items-center justify-between px-2 py-1">
                    <p className="text-sm font-bold text-slate-900">Notifications</p>
                    <span className="text-xs text-slate-500">{unreadCount} unread</span>
                  </div>

                  <div className="max-h-80 space-y-2 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                        No service updates yet.
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification._id}
                          type="button"
                          onClick={() => markRead(notification._id)}
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            notification.read ? "border-slate-200 bg-slate-50" : "border-blue-200 bg-blue-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                            {!notification.read && (
                              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                            )}
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-600">{notification.message}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {session ? (
              <>
                <span className="text-sm font-semibold text-slate-700">{role}</span>
                <button onClick={() => { logout(); navigate("/"); }} className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage setSession={setSession} session={session} />} />

        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route path="/queue/:tokenId" element={<LiveQueue />} />
        <Route path="/token/:id" element={<TokenPage />} />
        <Route path="/hospitals" element={hasUserAccess ? <Hospitals /> : <Navigate to="/login" replace />} />
        <Route path="/government-offices" element={hasUserAccess ? <GovernmentOffices /> : <Navigate to="/login" replace />} />
        <Route path="/documents" element={hasUserAccess ? <Documents /> : <Navigate to="/login" replace />} />
        <Route path="/ai-assistant" element={hasUserAccess ? <AiAssistant /> : <Navigate to="/login" replace />} />

        <Route path="/hospital-dashboard" element={hasHospitalAccess ? <HospitalDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/hospital-queue/:tokenId" element={hasHospitalAccess ? <HospitalLiveQueue /> : <Navigate to="/login" replace />} />
        <Route path="/office-dashboard" element={hasOfficeAccess ? <OfficeDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/office-queue/:tokenId" element={hasOfficeAccess ? <OfficeLiveQueue /> : <Navigate to="/login" replace />} />

        <Route path="/officer" element={<OfficerDashboard />} />
        <Route path="/admin" element={session?.role === "ADMIN" ? <AdminDashboard /> : <Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

function LoginPage({ setSession, session }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "admin", password: "admin123", role: "ADMIN" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const nextSession = {
        token: data.token,
        userId: data.user._id,
        username: data.user.username,
        role: data.user.role,
        hospitalId: data.user.hospitalId || null,
        officeId: data.user.officeId || null,
      };

      setSession(nextSession);
      navigate(data.user.role === "ADMIN" ? "/admin" : data.user.role === "HOSPITAL" ? "/hospital-dashboard" : data.user.role === "GOVERNMENT OFFICE" ? "/office-dashboard" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Access Portal</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">QueueLess India Login</h1>
        <p className="mt-2 text-sm text-slate-600">Use the demo admin account or create hospital/office accounts via backend.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Username</label>
            <input name="username" value={form.username} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none">
              <option value="USER">USER</option>
              <option value="HOSPITAL">HOSPITAL</option>
              <option value="GOVERNMENT OFFICE">GOVERNMENT OFFICE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-700 py-3 font-semibold text-white">
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Home() {
  const sections = [
    {
      title: "HOSPITALS",
      description:
        "Find nearby hospitals, doctors and appointments",
      to: "/hospitals",
      icon: <Hospital className="h-6 w-6" />,
    },
    {
      title: "GOVERNMENT OFFICES",
      description:
        "Find government offices, officers and appointments",
      to: "/government-offices",
      icon: <Building2 className="h-6 w-6" />,
    },
    {
      title: "DOCUMENTS & CERTIFICATES",
      description:
        "Find required documents, application process and processing time",
      to: "/documents",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      title: "AI ASSISTANT",
      description:
        "Ask questions about hospitals, offices and documents",
      to: "/ai-assistant",
      icon: <Bot className="h-6 w-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      <section className="bg-white">

        <div className="mx-auto max-w-7xl px-6 py-16">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700 text-white">
            <ShieldCheck />
          </div>

          <h1 className="mt-5 text-center text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            QueueLess India
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-center text-lg leading-8 text-slate-600">
            Smart queue, availability and citizen service platform.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {sections.map((section) => (
              <Link
                key={section.to}
                to={section.to}
                className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white">
                      {section.icon}
                    </div>

                    <h2 className="mt-5 text-xl font-black text-slate-900">
                      {section.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {section.description}
                    </p>
                  </div>

                  <ArrowRight className="mt-2 h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
                </div>
              </Link>
            ))}
          </div>

        </div>

      </section>

    </div>
  );
}

export default App;
