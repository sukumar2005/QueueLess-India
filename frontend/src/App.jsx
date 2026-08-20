import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import { QueueProvider } from "./context/QueueContext";
import AppShell from "./components/AppShell";
import TrackAppointment from "./pages/TrackAppointment";

const getStoredSession = () => {
  try {
    const raw = localStorage.getItem("queueless_session");

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

function App() {
  const [session, setSession] = useState(
    getStoredSession
  );

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
            element={
              <TrackAppointment />
            }
          />

          {/* ==================================================
              ALL OTHER PAGES
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