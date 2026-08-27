import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import { QueueProvider } from "./context/QueueContext";
import AppShell from "./components/AppShell";

import TrackAppointment from "./pages/TrackAppointment";
import HospitalLiveQueue from "./pages/HospitalLiveQueue";
import OfficeDashboard from "./pages/OfficeDashboard";
import OfficeLiveQueue from "./pages/OfficeLiveQueue";

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
      localStorage.setItem(
        "queueless_session",
        JSON.stringify(session)
      );
    } else {
      localStorage.removeItem("queueless_session");
    }
  }, [session]);

  const logout = () => {
    setSession(null);
  };

  return (
    <QueueProvider>
      <BrowserRouter>
        <Routes>

          {/* ==================================================
              TRACK APPOINTMENT
          ================================================== */}

          <Route
            path="/track-appointment"
            element={<TrackAppointment />}
          />


          {/* ==================================================
              HOSPITAL LIVE QUEUE
          ================================================== */}

          <Route
            path="/hospital-queue/:tokenId"
            element={<HospitalLiveQueue />}
          />


          {/* ==================================================
              GOVERNMENT OFFICE DASHBOARD
          ================================================== */}

          <Route
            path="/office/dashboard"
            element={<OfficeDashboard />}
          />


          {/* ==================================================
              GOVERNMENT OFFICE LIVE QUEUE
          ================================================== */}

          <Route
            path="/office-queue/:tokenId"
            element={<OfficeLiveQueue />}
          />


          {/* ==================================================
              ALL OTHER APPLICATION PAGES
          ================================================== */}

          <Route
            path="*"
            element={
              <AppShell
                session={session}
                setSession={setSession}
                logout={logout}
              />
            }
          />

        </Routes>
      </BrowserRouter>
    </QueueProvider>
  );
}

export default App;