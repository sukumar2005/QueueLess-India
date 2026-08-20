import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import Services from "../pages/Services";
import ServiceDetails from "../pages/ServiceDetails";
import LiveQueue from "../pages/LiveQueue";
import OfficerDashboard from "../pages/OfficerDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import TokenPage from "../pages/TokenPage";
import Hospitals from "../pages/Hospitals";
import GovernmentOffices from "../pages/GovernmentOffices";
import Documents from "../pages/Documents";
import Complaints from "../pages/Complaints";
import AiAssistant from "../pages/AiAssistant";
import HospitalLiveQueue from "../pages/HospitalLiveQueue";
import HospitalDashboard from "../pages/HospitalDashboard";
import OfficeLiveQueue from "../pages/OfficeLiveQueue";
import OfficeDashboard from "../pages/OfficeDashboard";
import RegisterPage from "../pages/RegisterPage";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://queueless-india-a2ju.onrender.com/api";

function AppShell({ session, setSession, logout }) {
  const navigate = useNavigate();

  const role = session?.role;

  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Normalize role
  const normalizedRole = role?.trim().toUpperCase();

  // User access
  const hasUserAccess =
    normalizedRole === "USER" ||
    normalizedRole === "ADMIN" ||
    !normalizedRole;

  // Hospital access
  const hasHospitalAccess =
    normalizedRole === "HOSPITAL" ||
    normalizedRole === "ADMIN";

  // Government office access
  const hasOfficeAccess =
    normalizedRole === "GOVERNMENT OFFICE" ||
    normalizedRole === "ADMIN";

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

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
        console.error(
          "Failed to load notifications",
          error
        );
      }
    };

    loadNotifications();

    const interval = setInterval(
      loadNotifications,
      15000
    );

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  // ==========================================
  // MARK NOTIFICATION AS READ
  // ==========================================

  const markRead = async (id) => {
    try {
      await fetch(
        `${API_URL}/notifications/${id}/read`,
        {
          method: "PATCH",
        }
      );

      setNotifications((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, read: true }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read",
        error
      );
    }
  };

  // ==========================================
  // APP SHELL
  // ==========================================

  return (
    <>
      {/* ========================================
          HEADER
      ======================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* LOGO */}

          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 font-bold text-white">
              Q
            </div>

            <div>
              <p className="font-bold">
                QueueLess India
              </p>

              <p className="text-xs text-slate-500">
                Public Service Platform
              </p>
            </div>
          </Link>

          {/* HEADER ACTIONS */}

          <div className="flex items-center gap-5">

            {/* FIND SERVICE */}

            <Link
              to="/services"
              className="text-sm font-semibold text-slate-600 hover:text-blue-700"
            >
              Find Service
            </Link>

            {/* NOTIFICATIONS */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setNotificationsOpen(
                    (current) => !current
                  )
                }
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

                    <p className="text-sm font-bold text-slate-900">
                      Notifications
                    </p>

                    <span className="text-xs text-slate-500">
                      {unreadCount} unread
                    </span>

                  </div>

                  <div className="max-h-80 space-y-2 overflow-y-auto">

                    {notifications.length === 0 ? (

                      <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                        No service updates yet.
                      </div>

                    ) : (

                      notifications.map(
                        (notification) => (

                          <button
                            key={notification._id}
                            type="button"
                            onClick={() =>
                              markRead(
                                notification._id
                              )
                            }
                            className={`w-full rounded-xl border p-3 text-left transition ${
                              notification.read
                                ? "border-slate-200 bg-slate-50"
                                : "border-blue-200 bg-blue-50"
                            }`}
                          >

                            <div className="flex items-center justify-between gap-3">

                              <p className="text-sm font-semibold text-slate-900">
                                {notification.title}
                              </p>

                              {!notification.read && (
                                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                              )}

                            </div>

                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              {notification.message}
                            </p>

                          </button>

                        )
                      )

                    )}

                  </div>

                </div>
              )}

            </div>

            {/* SESSION */}

            {session ? (

              <>
                <span className="text-sm font-semibold text-slate-700">
                  {role}
                </span>

                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Logout
                </button>
              </>

            ) : (

              <Link
                to="/login"
                className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Login
              </Link>

            )}

          </div>

        </div>
      </header>

      {/* ========================================
          ROUTES
      ======================================== */}

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={
            <Home session={session} />
          }
        />

        {/* LOGIN */}

        <Route
          path="/login"
          element={
            <LoginPage
              setSession={setSession}
              session={session}
            />
          }
        />

        {/* ======================================
            PUBLIC / USER
        ====================================== */}

        <Route
          path="/services"
          element={<Services />}
        />

        <Route
          path="/services/:id"
          element={<ServiceDetails />}
        />

        <Route
          path="/queue/:tokenId"
          element={<LiveQueue />}
        />

        <Route
          path="/token/:id"
          element={<TokenPage />}
        />

        <Route
          path="/hospitals"
          element={
            hasUserAccess ? (
              <Hospitals />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        <Route
          path="/government-offices"
          element={
            hasUserAccess ? (
              <GovernmentOffices />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        <Route
          path="/documents"
          element={
            hasUserAccess ? (
              <Documents />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />
        <Route
  path="/register"
  element={<RegisterPage />}
/>

        <Route
          path="/complaints"
          element={<Complaints />}
        />

        <Route
          path="/ai-assistant"
          element={
            hasUserAccess ? (
              <AiAssistant />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* ======================================
            HOSPITAL
        ====================================== */}

        <Route
          path="/hospital-dashboard"
          element={
            hasHospitalAccess ? (
              <HospitalDashboard />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        <Route
          path="/hospital-queue/:tokenId"
          element={
            hasHospitalAccess ? (
              <HospitalLiveQueue />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* ======================================
            GOVERNMENT OFFICE
        ====================================== */}

        <Route
          path="/office-dashboard"
          element={
            hasOfficeAccess ? (
              <OfficeDashboard />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        <Route
          path="/office-queue/:tokenId"
          element={
            hasOfficeAccess ? (
              <OfficeLiveQueue />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* ======================================
            OFFICER
        ====================================== */}

        <Route
          path="/officer"
          element={<OfficerDashboard />}
        />

        {/* ======================================
            ADMIN
        ====================================== */}

        <Route
          path="/admin"
          element={
            session?.role?.trim().toUpperCase() ===
            "ADMIN" ? (
              <AdminDashboard />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />
        

      </Routes>
    </>
  );
}

export default AppShell;