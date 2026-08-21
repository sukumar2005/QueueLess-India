import {
  Clock3,
  MapPin,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

function HospitalLiveQueue() {
  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    try {
      setError("");

      const savedToken = localStorage.getItem(
        "queueless_hospital_token"
      );

      if (!savedToken) {
        setError("No hospital appointment found.");
        setLoading(false);
        return;
      }

      let parsedToken;

      try {
        parsedToken = JSON.parse(savedToken);
      } catch {
        setError("Invalid appointment data.");
        setLoading(false);
        return;
      }

      const hospitalId =
        parsedToken.hospital?._id ||
        parsedToken.hospital;

      const doctorId =
        parsedToken.doctor?._id ||
        parsedToken.doctor;

      if (!hospitalId || !doctorId) {
        setError(
          "Hospital or doctor information is missing."
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/hospitals/queue/status?hospitalId=${hospitalId}&doctorId=${doctorId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load live queue."
        );
      }

      const latestQueue = Array.isArray(data.queue)
        ? data.queue
        : [];

      const latestToken =
        latestQueue.find(
          (token) =>
            String(token._id) ===
            String(parsedToken._id)
        ) || parsedToken;

      const waitingTokens =
        latestQueue.filter(
          (token) => token.status === "waiting"
        );

      const userIndex =
        waitingTokens.findIndex(
          (token) =>
            String(token._id) ===
            String(parsedToken._id)
        );

      const averageTime =
        Number(
          latestToken.doctor
            ?.averageConsultationTime
        ) || 15;

      setQueue(latestQueue);

      setCurrentToken(
        data.currentToken || null
      );

      setUserToken(latestToken);

      setPeopleAhead(
        userIndex >= 0 ? userIndex : 0
      );

      setEstimatedWait(
        userIndex >= 0
          ? userIndex * averageTime
          : 0
      );

      localStorage.setItem(
        "queueless_hospital_token",
        JSON.stringify(latestToken)
      );
    } catch (err) {
      console.error(
        "Hospital queue error:",
        err
      );

      setError(
        err.message ||
          "Unable to load live queue."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Delay the first request so React's
    // set-state-in-effect lint rule is satisfied.
    const firstLoad = setTimeout(() => {
      loadQueue();
    }, 0);

    const interval = setInterval(() => {
      loadQueue();
    }, 5000);

    return () => {
      clearTimeout(firstLoad);
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">

        {/* BACK */}
        <Link
          to="/hospitals"
          className="font-semibold text-blue-700"
        >
          ← Back to Hospitals
        </Link>

        {/* HEADER */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Hospital Live Queue
            </h1>

            <p className="mt-2 text-slate-500">
              Track your appointment in real time.
            </p>
          </div>

          <button
            onClick={loadQueue}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 font-semibold shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* MAIN QUEUE */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* NOW SERVING */}
          <section className="rounded-3xl border bg-white p-8 text-center shadow-sm lg:col-span-2">

            <p className="text-sm font-semibold text-slate-500">
              NOW SERVING
            </p>

            <p className="mt-2 text-5xl font-black text-slate-900">
              {currentToken?.tokenNumber ||
                "None"}
            </p>

            <div className="mt-8 rounded-3xl bg-blue-700 p-8 text-white">

              <p className="text-sm font-semibold text-blue-200">
                YOUR TOKEN
              </p>

              <p className="mt-2 text-6xl font-black">
                {userToken?.tokenNumber ||
                  "Not Found"}
              </p>

              {userToken?.status && (
                <p className="mt-4 text-lg font-semibold capitalize">
                  Status: {userToken.status}
                </p>
              )}

            </div>

            {userToken?.doctor?.name && (
              <div className="mt-6">
                <p className="text-sm text-slate-500">
                  Doctor
                </p>

                <p className="font-bold text-slate-900">
                  {userToken.doctor.name}
                </p>
              </div>
            )}

          </section>

          {/* QUEUE INFORMATION */}
          <section className="rounded-3xl border bg-white p-6 shadow-sm">

            <h2 className="font-bold text-slate-900">
              Queue Information
            </h2>

            <div className="mt-5 space-y-3">

              <Info
                icon={<Users />}
                label="People Ahead"
                value={peopleAhead}
              />

              <Info
                icon={<Clock3 />}
                label="Estimated Wait"
                value={`${estimatedWait} min`}
              />

              <Info
                icon={<MapPin />}
                label="Room"
                value={
                  userToken?.doctor?.room ||
                  "Not assigned"
                }
              />

              <Info
                icon={<UserCheck />}
                label="Counter"
                value={
                  userToken?.counter
                    ? `Counter ${userToken.counter}`
                    : "Not assigned yet"
                }
              />

            </div>
          </section>
        </div>

        {/* APPOINTMENT DETAILS */}
        {userToken && (
          <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-900">
              Appointment Details
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <Detail
                label="Patient"
                value={
                  userToken.patientName ||
                  userToken.citizenName ||
                  "Patient"
                }
              />

              <Detail
                label="Problem"
                value={
                  userToken.problem ||
                  "General Checkup"
                }
              />

              <Detail
                label="Expected Time"
                value={
                  userToken.expectedTime ||
                  "Calculating..."
                }
              />

              <Detail
                label="Status"
                value={
                  userToken.status ||
                  "waiting"
                }
              />

            </div>
          </section>
        )}

        {/* WAITING QUEUE */}
        <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Waiting Queue
          </h2>

          {queue.filter(
            (token) =>
              token.status === "waiting"
          ).length === 0 ? (
            <p className="mt-5 text-slate-500">
              No patients are currently waiting.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">

              {queue
                .filter(
                  (token) =>
                    token.status ===
                    "waiting"
                )
                .map((token, index) => (
                  <div
                    key={token._id}
                    className={`flex items-center justify-between py-4 ${
                      String(token._id) ===
                      String(userToken?._id)
                        ? "rounded-xl bg-blue-50 px-4"
                        : ""
                    }`}
                  >

                    <div className="flex items-center gap-4">

                      <span className="text-sm font-semibold text-slate-400">
                        #{index + 1}
                      </span>

                      <span className="font-bold text-slate-900">
                        {token.tokenNumber}
                      </span>

                    </div>

                    <span className="text-sm capitalize text-slate-500">
                      {token.source || "online"}
                    </span>

                  </div>
                ))}

            </div>
          )}

        </section>

        {/* BACK / BOOK ANOTHER */}
        <div className="mt-8 flex gap-4">

          <Link
            to="/hospitals"
            className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
          >
            Book Another Appointment
          </Link>

        </div>

      </div>
    </main>
  );
}

function Info({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">

      <div className="flex items-center gap-3 text-slate-600">

        <span className="text-blue-700">
          {icon}
        </span>

        <span className="text-sm">
          {label}
        </span>

      </div>

      <span className="text-sm font-bold text-slate-900">
        {value}
      </span>

    </div>
  );
}

function Detail({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-bold capitalize text-slate-900">
        {value}
      </p>

    </div>
  );
}

export default HospitalLiveQueue;