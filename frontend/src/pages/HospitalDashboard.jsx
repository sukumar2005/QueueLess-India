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

function HospitalDashboard() {
  const session = JSON.parse(localStorage.getItem("queueless_session") || "null");
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitalId, setHospitalId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [counter, setCounter] = useState(1);
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [attendanceError, setAttendanceError] = useState("");
  const [breakReason, setBreakReason] = useState("");
  const [workingStart, setWorkingStart] = useState("09:00");
  const [workingEnd, setWorkingEnd] = useState("18:00");
  const [error, setError] = useState("");

  const selectedHospital = hospitals.find(
    (hospital) => hospital._id === hospitalId
  );

  const selectedDoctor = doctors.find(
    (doctor) => doctor._id === doctorId
  );

  const waitingQueue = queue.filter(
    (token) => token.status === "waiting"
  );

  const loadHospitals = async () => {
    const response = await fetch(`${API_URL}/hospitals`, {
      headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
    });
    const data = await response.json();

    if (response.ok) {
      const list = data.hospitals || [];
      setHospitals(list);
      if (list[0] && !hospitalId) {
        setHospitalId(list[0]._id);
      }
    }
  };

  const loadDoctors = async () => {
    if (!hospitalId) return;

    const response = await fetch(
      `${API_URL}/hospitals/${hospitalId}/doctors`,
      {
        headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
      }
    );
    const data = await response.json();

    if (response.ok) {
      const list = data.doctors || [];
      setDoctors(list);
      if (list[0]) {
        setDoctorId(list[0]._id);
      }
    }
  };

  const loadQueue = async () => {
    if (!hospitalId || !doctorId) return;

    const response = await fetch(
      `${API_URL}/hospitals/queue/status?hospitalId=${hospitalId}&doctorId=${doctorId}`,
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
    loadHospitals();
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [hospitalId]);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, [hospitalId, doctorId]);

  const createOfflineToken = async () => {
    if (!patientName.trim() || !hospitalId || !doctorId) {
      setError("Patient name, hospital and doctor are required.");
      return;
    }

    const response = await fetch(`${API_URL}/hospitals/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      body: JSON.stringify({
        patientName: patientName.trim(),
        phone,
        hospitalId,
        doctorId,
        source: "offline",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Unable to create offline token");
      return;
    }

    setPatientName("");
    setPhone("");
    setError("");
    loadQueue();
  };

  const queueAction = async (action) => {
    const response = await fetch(
      `${API_URL}/hospitals/queue/${action}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({
          hospitalId,
          doctorId,
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

  const updateDoctorAttendance = async (action) => {
    if (!hospitalId || !doctorId) {
      setAttendanceError("Select a hospital and doctor first.");
      return;
    }

    const response = await fetch(
      `${API_URL}/hospitals/${hospitalId}/doctors/${doctorId}/attendance`,
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
    loadDoctors();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <Link to="/" className="font-semibold text-blue-700">
          Back to Home
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Hospital Staff
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Hospital Queue Dashboard
          </h1>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-4 rounded-3xl border bg-white p-6 shadow-sm md:grid-cols-3">
          <Select
            label="Hospital"
            value={hospitalId}
            onChange={setHospitalId}
            options={hospitals.map((hospital) => ({
              value: hospital._id,
              label: hospital.name,
            }))}
          />

          <Select
            label="Doctor"
            value={doctorId}
            onChange={setDoctorId}
            options={doctors.map((doctor) => ({
              value: doctor._id,
              label: `${doctor.name} - ${doctor.specialization}`,
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
            <h2 className="font-bold text-slate-900">Doctor Attendance</h2>
            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-semibold">Status</p>
              <p className="mt-1">
                {selectedDoctor?.attendanceStatus || "Present"}
              </p>
              {selectedDoctor?.isOnBreak && (
                <p className="mt-1 text-amber-700">
                  Break: {selectedDoctor?.breakReason || "Break"}
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => updateDoctorAttendance("checkin")} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white">Check In</button>
              <button onClick={() => updateDoctorAttendance("checkout")} className="rounded-xl bg-slate-700 px-3 py-2 text-sm font-semibold text-white">Check Out</button>
              <button onClick={() => updateDoctorAttendance("break-start")} className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white">Start Break</button>
              <button onClick={() => updateDoctorAttendance("break-end")} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">End Break</button>
            </div>
            <div className="mt-4 space-y-3">
              <input value={breakReason} onChange={(event) => setBreakReason(event.target.value)} placeholder="Break reason" className="w-full rounded-xl border px-3 py-2 text-sm" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="time" value={workingStart} onChange={(event) => setWorkingStart(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" />
                <input type="time" value={workingEnd} onChange={(event) => setWorkingEnd(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" />
              </div>
              <button onClick={() => updateDoctorAttendance("working-hours")} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Save Working Hours</button>
            </div>
            {attendanceError && (
              <p className="mt-3 text-sm text-red-600">{attendanceError}</p>
            )}
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">
              Create Offline Token
            </h2>
            <input
              value={patientName}
              onChange={(event) => setPatientName(event.target.value)}
              placeholder="Patient name"
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
              CURRENT SERVING
            </p>
            <p className="mt-3 text-5xl font-black">
              {currentToken?.tokenNumber || "None"}
            </p>
            <p className="mt-3 text-sm text-blue-100">
              {selectedHospital?.name || "Hospital"} •{" "}
              {selectedDoctor?.name || "Doctor"}
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

export default HospitalDashboard;
