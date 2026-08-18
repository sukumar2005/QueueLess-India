import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  RefreshCw,
  SkipForward,
  User,
  Users,
  Play,
  Building2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "https://queueless-india-a2ju.onrender.com/api";

function OfficerDashboard() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");

  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [officerCounter, setOfficerCounter] = useState(1);

  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD SERVICES
  // ==========================================

  const loadServices = async () => {
    try {
      setLoadingServices(true);

      const response = await fetch(
        `${API_URL}/services`
      );

      if (!response.ok) {
        throw new Error("Unable to load services");
      }

      const data = await response.json();

      const serviceList = data.services || [];

      setServices(serviceList);

      if (
        serviceList.length > 0 &&
        !selectedService
      ) {
        setSelectedService(serviceList[0]._id);
      }

    } catch (err) {
      console.error(err);
      setError("Unable to load government services.");
    } finally {
      setLoadingServices(false);
    }
  };

  // ==========================================
  // LOAD SERVICE QUEUE
  // ==========================================

  const loadQueue = async () => {
    if (!selectedService) {
      return;
    }

    try {
      setLoadingQueue(true);
      setError("");

      const response = await fetch(
        `${API_URL}/queue/status?serviceId=${selectedService}`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load service queue"
        );
      }

      const data = await response.json();

      setQueue(data.queue || []);
      setCurrentToken(data.currentToken || null);

    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the selected service queue."
      );
    } finally {
      setLoadingQueue(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

useEffect(() => {
  const timer = setTimeout(() => {
    loadServices();
  }, 0);

  return () => {
    clearTimeout(timer);
  };
}, []);

  // ==========================================
  // LOAD QUEUE WHEN SERVICE CHANGES
  // ==========================================

  useEffect(() => {
    if (!selectedService) {
      return;
    }

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
  }, [selectedService]);

  // ==========================================
  // CALL NEXT
  // ==========================================

  const handleCallNext = async () => {
    if (!selectedService) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/queue/next`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            serviceId: selectedService,
            counter: officerCounter,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to call next token"
        );
      }

      await loadQueue();

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // COMPLETE
  // ==========================================

  const handleComplete = async () => {
    if (!selectedService) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/queue/complete`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            serviceId: selectedService,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to complete service"
        );
      }

      await loadQueue();

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // SKIP
  // ==========================================

  const handleSkip = async () => {
    if (!selectedService) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/queue/skip`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            serviceId: selectedService,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to skip token"
        );
      }

      await loadQueue();

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const waitingQueue = queue.filter(
    (token) => token.status === "waiting"
  );

  const selectedServiceData =
    services.find(
      (service) =>
        service._id === selectedService
    );

  // ==========================================
  // LOADING
  // ==========================================

  if (loadingServices) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

          <p className="mt-4 text-slate-500">
            Loading officer dashboard...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              Authority Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Officer Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Municipal Administration • Counter {officerCounter}
            </p>

          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* SERVICE SELECTOR */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Building2 className="h-5 w-5 text-blue-700" />

                <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                  Queue Service
                </p>

              </div>

              <h2 className="mt-2 text-xl font-bold">
                Select Government Service
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View and manage the queue for one service.
              </p>

            </div>

            <div className="w-full md:max-w-md">

              <label
                htmlFor="service"
                className="text-sm font-semibold text-slate-700"
              >
                Service
              </label>

              <select
                id="service"
                value={selectedService}
                onChange={(event) =>
                  setSelectedService(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >

                {services.map((service) => (

                  <option
                    key={service._id}
                    value={service._id}
                  >
                    {service.name}
                  </option>

                ))}

              </select>

            </div>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            <button
              onClick={loadQueue}
              className="text-sm font-semibold text-red-800"
            >
              Retry
            </button>

          </div>
        )}

        {/* TOP STATS */}

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <StatCard
            icon={<Users />}
            title="Waiting"
            value={waitingQueue.length}
            description="Citizens in selected queue"
          />

          <StatCard
            icon={<Clock3 />}
            title="Current Token"
            value={
              currentToken?.tokenNumber ||
              "None"
            }
            description="Currently being served"
          />

          <StatCard
            icon={<User />}
            title="Counter"
            value={officerCounter}
            description="Officer available"
          />

        </div>

        {/* SELECTED SERVICE */}

        {selectedServiceData && (
          <div className="mt-6 rounded-2xl bg-blue-50 p-5">

            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Active Service
            </p>

            <h2 className="mt-1 text-xl font-bold text-blue-950">
              {selectedServiceData.name}
            </h2>

            <p className="mt-1 text-sm text-blue-700">
              {selectedServiceData.department}
              {" • "}
              {selectedServiceData.office}
            </p>

          </div>
        )}

        {/* CURRENT TOKEN */}

        <section className="mt-8 rounded-3xl bg-blue-700 p-8 text-white shadow-sm">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                Currently Serving
              </p>

              <h2 className="mt-2 text-6xl font-black">
                {currentToken?.tokenNumber ||
                  "---"}
              </h2>

              {currentToken && (
                <p className="mt-3 text-blue-100">

                  Citizen:{" "}

                  <span className="font-semibold text-white">
                    {currentToken.citizenName}
                  </span>

                </p>
              )}

            </div>

            {currentToken && (
              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Complete
                </button>

                <button
                  onClick={handleSkip}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  <SkipForward className="h-5 w-5" />
                  Skip
                </button>

              </div>
            )}

            {!currentToken && (
              <div className="rounded-2xl bg-white/10 p-5">

                <p className="text-sm text-blue-100">
                  No citizen is currently being served.
                </p>

              </div>
            )}

          </div>

        </section>

        {/* WAITING QUEUE */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center">

            <div>

              <h2 className="text-xl font-bold">
                Waiting Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedServiceData?.name ||
                  "Selected service"}{" "}
                citizens waiting to be served.
              </p>

            </div>

            <div className="flex gap-3">

              <select
                value={officerCounter}
                onChange={(event) =>
                  setOfficerCounter(Number(event.target.value))
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                aria-label="Officer counter"
              >
                <option value={1}>Counter 1</option>
                <option value={2}>Counter 2</option>
                <option value={3}>Counter 3</option>
              </select>

              <button
                onClick={loadQueue}
                disabled={loadingQueue}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>

              <button
                onClick={handleCallNext}
                disabled={
                  actionLoading ||
                  loadingQueue ||
                  waitingQueue.length === 0 ||
                  !!currentToken
                }
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play className="h-4 w-4" />
                Call Next
              </button>

            </div>

          </div>

          <div className="divide-y divide-slate-100">

            {waitingQueue.length === 0 && (
              <div className="p-12 text-center">

                <Users className="mx-auto h-10 w-10 text-slate-300" />

                <h3 className="mt-4 font-semibold text-slate-700">
                  Queue is empty
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  No citizens are waiting for this service.
                </p>

              </div>
            )}

            {waitingQueue.map(
              (token, index) => (

                <div
                  key={token._id}
                  className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                      {index + 1}
                    </div>

                    <div>

                      <p className="text-lg font-bold text-slate-900">
                        {token.tokenNumber}
                      </p>

                      <p className="text-sm text-slate-500">
                        {token.citizenName}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-6">

                    <div className="text-right">

                      <p className="text-xs text-slate-400">
                        SERVICE
                      </p>

                      <p className="text-sm font-semibold text-slate-700">
                        {token.service?.name ||
                          selectedServiceData?.name ||
                          "Government Service"}
                      </p>

                    </div>

                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                      Waiting
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

        {/* AI INSIGHT */}

        <section className="mt-8 rounded-3xl border border-green-100 bg-green-50 p-6">

          <p className="text-sm font-bold text-green-800">
            🤖 AI Queue Insight
          </p>

          <h2 className="mt-2 text-xl font-bold text-green-900">
            Service demand monitoring
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-green-700">

            QueueLess India can analyze waiting volume,
            average service time and officer availability
            to predict demand and recommend the best time
            for citizens to visit.

          </p>

        </section>

      </main>

    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-black text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}

export default OfficerDashboard;
