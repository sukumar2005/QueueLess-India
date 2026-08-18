import {
  CheckCircle2,
  Play,
  RefreshCw,
  SkipForward,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://queueless-india-a2ju.onrender.com/api";

function OfficeDashboard() {
  const session = JSON.parse(localStorage.getItem("queueless_session") || "null");
  const [offices, setOffices] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [officeId, setOfficeId] = useState("");
  const [officerId, setOfficerId] = useState("");
  const [counter, setCounter] = useState(1);
  const [citizenName, setCitizenName] = useState("");
  const [phone, setPhone] = useState("");
  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [attendanceError, setAttendanceError] = useState("");
  const [breakReason, setBreakReason] = useState("");
  const [workingStart, setWorkingStart] = useState("09:00");
  const [workingEnd, setWorkingEnd] = useState("18:00");
  const [error, setError] = useState("");

  const waitingQueue = queue.filter(
    (token) => token.status === "waiting"
  );

  const selectedOfficer = officers.find(
    (officer) => officer._id === officerId
  );

  const loadOffices = async () => {
    const response = await fetch(`${API_URL}/government-offices`, {
      headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
    });
    const data = await response.json();

    if (response.ok) {
      const list = data.offices || [];
      setOffices(list);
      if (list[0] && !officeId) {
        setOfficeId(list[0]._id);
      }
    }
  };

  const loadOfficers = async () => {
    if (!officeId) return;

    const response = await fetch(
      `${API_URL}/government-offices/${officeId}/officers`,
      {
        headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
      }
    );
    const data = await response.json();

    if (response.ok) {
      const list = data.officers || [];
      setOfficers(list);
      if (list[0]) {
        setOfficerId(list[0]._id);
      }
    }
  };

  const loadQueue = async () => {
    if (!officeId || !officerId) return;

    const response = await fetch(
      `${API_URL}/government-offices/queue/status?officeId=${officeId}&officerId=${officerId}`,
      {
        headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
      }
    );
    const data = await response.json();

    if (response.ok) {
      setQueue(data.queue || []);
      setCurrentToken(data.currentToken || null);
    }
  };

  useEffect(() => {
    loadOffices();
  }, []);

  useEffect(() => {
    loadOfficers();
  }, [officeId]);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, [officeId, officerId]);

  const createOfflineToken = async () => {
    if (!citizenName.trim() || !officeId || !officerId) {
      setError("Citizen name, office and officer are required.");
      return;
    }

    const response = await fetch(
      `${API_URL}/government-offices/tokens`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({
          citizenName: citizenName.trim(),
          phone,
          officeId,
          officerId,
          purpose: "Offline Visit",
          source: "offline",
        }),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Unable to create offline token");
      return;
    }

    setCitizenName("");
    setPhone("");
    setError("");
    loadQueue();
  };

  const queueAction = async (action) => {
    const response = await fetch(
      `${API_URL}/government-offices/queue/${action}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({
          officeId,
          officerId,
          counter,
        }),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Queue action failed");
      return;
    }

    setError("");
    loadQueue();
  };

  const updateOfficerAttendance = async (action) => {
    if (!officeId || !officerId) {
      setAttendanceError("Select an office and officer first.");
      return;
    }

    const response = await fetch(
      `${API_URL}/government-offices/${officeId}/officers/${officerId}/attendance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({
          action,
          reason: breakReason,
          start: workingStart,
          end: workingEnd,
        }),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      setAttendanceError(data.message || "Attendance update failed");
      return;
    }

    setAttendanceError("");
    setBreakReason("");
    loadOfficers();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <Link to="/" className="font-semibold text-blue-700">
          Back to Home
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-slate-900">
          Government Office Queue Dashboard
        </h1>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-4 rounded-3xl border bg-white p-6 shadow-sm md:grid-cols-3">
          <Select
            label="Office"
            value={officeId}
            onChange={setOfficeId}
            options={offices.map((office) => ({
              value: office._id,
              label: office.name,
            }))}
          />
          <Select
            label="Officer"
            value={officerId}
            onChange={setOfficerId}
            options={officers.map((officer) => ({
              value: officer._id,
              label: `${officer.name} - ${officer.designation}`,
            }))}
          />
          <Select
            label="Counter"
            value={counter}
            onChange={(value) => setCounter(Number(value))}
            options={[
              { value: 1, label: "Counter 1" },
              { value: 2, label: "Counter 2" },
              { value: 3, label: "Counter 3" },
            ]}
          />
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="font-bold">Officer Attendance</h2>
            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-semibold">Status</p>
              <p className="mt-1">{selectedOfficer?.attendanceStatus || "Present"}</p>
              {selectedOfficer?.isOnBreak && (
                <p className="mt-1 text-amber-700">
                  Break: {selectedOfficer?.breakReason || "Break"}
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => updateOfficerAttendance("checkin")} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check In</button>
              <button onClick={() => updateOfficerAttendance("checkout")} className="rounded-xl bg-slate-700 px-3 py-2 text-sm font-semibold text-white">Check Out</button>
              <button onClick={() => updateOfficerAttendance("break-start")} className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white">Start Break</button>
              <button onClick={() => updateOfficerAttendance("break-end")} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">End Break</button>
            </div>
            <div className="mt-4 space-y-3">
              <input value={breakReason} onChange={(event) => setBreakReason(event.target.value)} placeholder="Break reason" className="w-full rounded-xl border px-3 py-2 text-sm" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="time" value={workingStart} onChange={(event) => setWorkingStart(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" />
                <input type="time" value={workingEnd} onChange={(event) => setWorkingEnd(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" />
              </div>
              <button onClick={() => updateOfficerAttendance("working-hours")} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Save Working Hours</button>
            </div>
            {attendanceError && (
              <p className="mt-3 text-sm text-red-600">{attendanceError}</p>
            )}
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="font-bold">Create Offline Token</h2>
            <input
              value={citizenName}
              onChange={(event) => setCitizenName(event.target.value)}
              placeholder="Citizen name"
              className="mt-4 w-full rounded-xl border px-4 py-3"
            />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone optional"
              className="mt-3 w-full rounded-xl border px-4 py-3"
            />
            <button
              onClick={createOfflineToken}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 font-semibold text-white"
            >
              <UserPlus className="h-4 w-4" />
              Create Offline Token
            </button>
          </section>

          <section className="rounded-3xl border bg-blue-700 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold text-blue-200">
              CURRENT TOKEN
            </p>
            <p className="mt-3 text-5xl font-black">
              {currentToken?.tokenNumber || "None"}
            </p>
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="font-bold">Queue Actions</h2>
            <p className="mt-2 text-sm text-slate-500">
              People Waiting: {waitingQueue.length}
            </p>
            <div className="mt-4 grid gap-3">
              <button
                onClick={() => queueAction("next")}
                disabled={!!currentToken || waitingQueue.length === 0}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 font-semibold text-white disabled:opacity-40"
              >
                <Play className="h-4 w-4" />
                Call Next
              </button>
              <button
                onClick={() => queueAction("complete")}
                disabled={!currentToken}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-700 py-3 font-semibold text-white disabled:opacity-40"
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </button>
              <button
                onClick={() => queueAction("skip")}
                disabled={!currentToken}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 font-semibold text-white disabled:opacity-40"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </button>
              <button
                onClick={loadQueue}
                className="flex items-center justify-center gap-2 rounded-xl border py-3 font-semibold text-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="font-bold">Unified Queue</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {waitingQueue.map((token) => (
              <div
                key={token._id}
                className="flex items-center justify-between py-4 text-sm"
              >
                <div>
                  <p className="font-bold">{token.tokenNumber}</p>
                  <p className="text-slate-500">{token.citizenName}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold uppercase text-slate-600">
                  {token.source}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default OfficeDashboard;
