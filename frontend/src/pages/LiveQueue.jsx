import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
  UserCheck,
  RefreshCw,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "https://queueless-india-a2ju.onrender.com/api";

function LiveQueue() {
  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [userToken, setUserToken] = useState(null);

  const [peopleAhead, setPeopleAhead] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQueue = async () => {
  try {
    setError("");

    // Get the citizen's token first
    const savedToken = localStorage.getItem(
      "queueless_user_token"
    );

    let parsedToken = null;

    if (savedToken) {
      parsedToken = JSON.parse(savedToken);
      setUserToken(parsedToken);
    }

    // Get the service ID from the user's token
    const serviceId = parsedToken?.service?._id;

    // Load only this service's queue
    const queueUrl = serviceId
      ? `${API_URL}/queue/status?serviceId=${serviceId}`
      : `${API_URL}/queue/status`;

    const response = await fetch(queueUrl);

    if (!response.ok) {
      throw new Error("Unable to load queue");
    }

    const data = await response.json();

    setQueue(data.queue || []);
    setCurrentToken(data.currentToken || null);

    if (parsedToken) {
      const waitingTokens = (data.queue || []).filter(
        (token) => token.status === "waiting"
      );

      const userIndex = waitingTokens.findIndex(
        (token) => token._id === parsedToken._id
      );

      if (userIndex >= 0) {
        setPeopleAhead(userIndex);
      } else {
        setPeopleAhead(0);
      }

      const averageTime =
        parsedToken.service?.averageTime || 15;

      setEstimatedWait(
        userIndex > 0
          ? userIndex * averageTime
          : 0
      );
    }
  } catch (err) {
    console.error(err);
    setError("Unable to connect to the live queue.");
  } finally {
    setLoading(false);
  }
};

 useEffect(() => {
  const timer = setTimeout(() => {
    loadQueue();
  }, 0);

  const interval = setInterval(() => {
    loadQueue();
  }, 5000);

  return () => {
    clearTimeout(timer);
    clearInterval(interval);
  };
}, []);

  const handleCallNext = async () => {
    try {
      const response = await fetch(
        `${API_URL}/queue/next`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to call next token"
        );
      }

      await loadQueue();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

          <p className="mt-4 text-slate-500">
            Loading live queue...
          </p>

        </div>

      </div>
    );
  }

  if (error && !queue.length) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-20 text-center">

        <h1 className="text-2xl font-bold">
          Queue unavailable
        </h1>

        <p className="mt-3 text-slate-500">
          {error}
        </p>

        <button
          onClick={loadQueue}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>

      </div>
    );
  }

  const currentTokenNumber =
    currentToken?.tokenNumber || "None";

  const userTokenNumber =
    userToken?.tokenNumber || "Not Found";

  const isYourTurn =
    userToken?.status === "serving" ||
    peopleAhead === 0;

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* BACK */}

        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Link>

        {/* HEADER */}

        <div className="mt-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Live Queue
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Track Your Queue
          </h1>

          <p className="mt-3 text-slate-600">
            Your position updates automatically as citizens are served.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* MAIN */}

          <div className="lg:col-span-2">

            <div className="rounded-3xl border bg-white p-8 shadow-sm">

              {/* CURRENT */}

              <div className="text-center">

                <p className="text-sm font-semibold text-slate-500">
                  CURRENTLY SERVING
                </p>

                <p className="mt-2 text-5xl font-black">
                  {currentTokenNumber}
                </p>

              </div>

              {/* USER TOKEN */}

              <div className="mt-8 rounded-3xl bg-blue-700 p-8 text-center text-white">

                <p className="text-sm font-semibold text-blue-200">
                  YOUR TOKEN
                </p>

                <p className="mt-2 text-6xl font-black">
                  {userTokenNumber}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">

                  <div>

                    <p className="text-3xl font-bold">
                      {peopleAhead}
                    </p>

                    <p className="text-sm text-blue-200">
                      People Ahead
                    </p>

                  </div>

                  <div>

                    <p className="text-3xl font-bold">
                      {estimatedWait}
                    </p>

                    <p className="text-sm text-blue-200">
                      Minutes
                    </p>

                  </div>

                </div>

              </div>

              {/* YOUR TURN */}

              {isYourTurn && userToken && (
                <div className="mt-6 rounded-2xl border-2 border-green-300 bg-green-50 p-6 text-center">

                  <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />

                  <h2 className="mt-3 text-2xl font-bold text-green-900">
                    Your Turn!
                  </h2>

                  <p className="mt-2 text-green-700">
                    Please proceed to the assigned counter.
                  </p>

                </div>
              )}

              {/* WAITING */}

              {!isYourTurn &&
                peopleAhead > 3 && (
                  <div className="mt-6 rounded-2xl bg-blue-50 p-5">

                    <div className="flex gap-3">

                      <Bell className="h-5 w-5 text-blue-700" />

                      <div>

                        <p className="font-bold text-blue-900">
                          You're in the queue
                        </p>

                        <p className="text-sm text-blue-700">
                          You can continue monitoring your position.
                        </p>

                      </div>

                    </div>

                  </div>
                )}

              {/* COMING SOON */}

              {!isYourTurn &&
                peopleAhead <= 3 &&
                peopleAhead > 0 && (
                  <div className="mt-6 rounded-2xl bg-amber-50 p-5">

                    <p className="font-bold text-amber-900">
                      Your turn is coming soon!
                    </p>

                    <p className="mt-1 text-sm text-amber-700">
                      Please stay near the service counter.
                    </p>

                  </div>
                )}

            </div>

          </div>

          {/* SIDE PANEL */}

          <div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <h2 className="font-bold">
                  Queue Information
                </h2>

                <button
                  onClick={loadQueue}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  title="Refresh queue"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>

              </div>

              <div className="mt-5 space-y-3">

                <InfoRow
                  icon={<Users />}
                  label="People Ahead"
                  value={peopleAhead}
                />

                <InfoRow
                  icon={<Clock3 />}
                  label="Estimated Wait"
                  value={`${estimatedWait} min`}
                />

                <InfoRow
                  icon={<MapPin />}
                  label="Office"
                  value={
                    userToken?.service?.office ||
                    "Government Office"
                  }
                />

                <InfoRow
                  icon={<UserCheck />}
                  label="Counter"
                  value={
                    userToken?.counter
                      ? `Counter ${userToken.counter}`
                      : "Assigned"
                  }
                />

              </div>

            </div>

            {/* DEMO CONTROL */}

            <div className="mt-6 rounded-3xl bg-amber-50 p-6">

              <p className="font-bold text-amber-900">
                🎬 Officer Demo
              </p>

              <p className="mt-2 text-sm text-amber-700">
                Simulate the officer calling the next citizen.
              </p>

              <button
                onClick={handleCallNext}
                className="mt-4 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Call Next Token
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">

      <div className="flex items-center gap-3">

        <div className="text-blue-700">
          {icon}
        </div>

        <span className="text-sm text-slate-600">
          {label}
        </span>

      </div>

      <span className="max-w-[150px] truncate text-right text-sm font-bold">
        {value}
      </span>

    </div>
  );
}

export default LiveQueue;