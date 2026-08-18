import { Clock3, RefreshCw, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://queueless-india-a2ju.onrender.com/api";

function OfficeLiveQueue() {
  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [error, setError] = useState("");

  const loadQueue = async () => {
    try {
      setError("");
      const savedToken = localStorage.getItem("queueless_office_token");

      if (!savedToken) {
        throw new Error("No government office token found.");
      }

      const parsedToken = JSON.parse(savedToken);
      const officeId =
        parsedToken.governmentOffice?._id ||
        parsedToken.governmentOffice;
      const officerId = parsedToken.officer?._id || parsedToken.officer;

      const response = await fetch(
        `${API_URL}/government-offices/queue/status?officeId=${officeId}&officerId=${officerId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load queue");
      }

      const latestQueue = data.queue || [];
      const latestToken =
        latestQueue.find((token) => token._id === parsedToken._id) ||
        parsedToken;
      const waitingTokens = latestQueue.filter(
        (token) => token.status === "waiting"
      );
      const userIndex = waitingTokens.findIndex(
        (token) => token._id === parsedToken._id
      );
      const averageTime = latestToken.officer?.averageServiceTime || 15;

      setQueue(latestQueue);
      setCurrentToken(data.currentToken || null);
      setUserToken(latestToken);
      setPeopleAhead(userIndex >= 0 ? userIndex : 0);
      setEstimatedWait(userIndex >= 0 ? userIndex * averageTime : 0);
      localStorage.setItem(
        "queueless_office_token",
        JSON.stringify(latestToken)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/government-offices"
          className="font-semibold text-blue-700"
        >
          Back to Government Offices
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-slate-900">
          Government Office Live Queue
        </h1>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border bg-white p-8 text-center shadow-sm lg:col-span-2">
            <p className="text-sm font-semibold text-slate-500">
              NOW SERVING
            </p>
            <p className="mt-2 text-5xl font-black">
              {currentToken?.tokenNumber || "None"}
            </p>
            <div className="mt-8 rounded-3xl bg-blue-700 p-8 text-white">
              <p className="text-sm font-semibold text-blue-200">
                YOUR TOKEN
              </p>
              <p className="mt-2 text-6xl font-black">
                {userToken?.tokenNumber || "Not Found"}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Queue Information</h2>
              <button onClick={loadQueue} title="Refresh queue">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 space-y-3">
              <Info icon={<Users />} label="People Ahead" value={peopleAhead} />
              <Info
                icon={<Clock3 />}
                label="Estimated Time"
                value={`${estimatedWait} min`}
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

        <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="font-bold">Waiting Queue</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {queue
              .filter((token) => token.status === "waiting")
              .map((token) => (
                <div
                  key={token._id}
                  className="flex justify-between py-3 text-sm"
                >
                  <span className="font-bold">{token.tokenNumber}</span>
                  <span className="text-slate-500">{token.source}</span>
                </div>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-3 text-slate-600">
        <span className="text-blue-700">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

export default OfficeLiveQueue;
