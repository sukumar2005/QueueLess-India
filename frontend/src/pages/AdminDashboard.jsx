import {
  ArrowLeft,
  BarChart3,
  Building2,
  Clock3,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "https://queueless-india-a2ju.onrender.com/api";

function AdminDashboard() {
  const [services, setServices] = useState([]);
  const [queue, setQueue] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");

      const [servicesResponse, queueResponse] =
        await Promise.all([
          fetch(`${API_URL}/services`),
          fetch(`${API_URL}/queue/status`),
        ]);

      if (!servicesResponse.ok) {
        throw new Error("Unable to load services");
      }

      if (!queueResponse.ok) {
        throw new Error("Unable to load queue");
      }

      const servicesData =
        await servicesResponse.json();

      const queueData =
        await queueResponse.json();

      setServices(
        servicesData.services || []
      );

      setQueue(
        queueData.queue || []
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load administration data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboard();
    }, 0);

    const interval = setInterval(() => {
      loadDashboard();
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const waitingTokens = queue.filter(
    (token) => token.status === "waiting"
  );

  const servingTokens = queue.filter(
    (token) => token.status === "serving"
  );

  const completedTokens = queue.filter(
    (token) => token.status === "completed"
  );

  const totalPeopleToday =
    queue.length;

  const totalWaiting =
    waitingTokens.length;

  const activeOfficers =
    services.reduce(
      (total, service) =>
        total +
        (service.availableOfficers || 0),
      0
    );

  const totalOfficers =
    services.reduce(
      (total, service) =>
        total +
        (service.totalOfficers || 0),
      0
    );

  const averageWait =
    services.length > 0
      ? Math.round(
          services.reduce(
            (total, service) =>
              total +
              (service.waitingTime || 0),
            0
          ) / services.length
        )
      : 0;

  const getServiceCount = (serviceId) => {
    return queue.filter(
      (token) =>
        token.service?._id === serviceId
    ).length;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

          <p className="mt-4 text-slate-500">
            Loading admin dashboard...
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
              Administration Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              QueueLess India Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor services, queues and resource utilization.
            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={loadDashboard}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>

          </div>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>

          </div>
        )}

        {/* OVERVIEW */}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<Users />}
            title="Total Queue"
            value={totalPeopleToday}
            description="Active tokens"
          />

          <StatCard
            icon={<Clock3 />}
            title="Waiting"
            value={totalWaiting}
            description="Citizens waiting"
          />

          <StatCard
            icon={<UserCheck />}
            title="Active Officers"
            value={`${activeOfficers}/${totalOfficers}`}
            description="Available officers"
          />

          <StatCard
            icon={<TrendingUp />}
            title="Avg. Wait"
            value={`${averageWait} min`}
            description="Across services"
          />

        </div>

        {/* SYSTEM STATUS */}

        <section className="mt-8 rounded-3xl bg-blue-700 p-8 text-white">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                System Status
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Public Services Operating Normally
              </h2>

              <p className="mt-2 max-w-2xl text-blue-100">
                QueueLess India is monitoring active government
                service queues and officer availability in real time.
              </p>

            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4">

              <span className="h-3 w-3 rounded-full bg-green-400" />

              <span className="font-semibold">
                All Systems Operational
              </span>

            </div>

          </div>

        </section>

        {/* SERVICE PERFORMANCE */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <BarChart3 className="h-5 w-5" />
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  Service Performance
                </h2>

                <p className="text-sm text-slate-500">
                  Current demand across government services.
                </p>

              </div>

            </div>

          </div>

          <div className="divide-y divide-slate-100">

            {services.map((service) => {

              const count =
                getServiceCount(
                  service._id
                );

              const demand = Math.min(
                Math.round(
                  (count / 8) * 100
                ),
                100
              );

              return (
                <div
                  key={service._id}
                  className="p-6"
                >

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">

                        <Building2 className="h-5 w-5 text-blue-700" />

                      </div>

                      <div>

                        <h3 className="font-bold text-slate-900">
                          {service.name}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {service.department}
                        </p>

                      </div>

                    </div>

                    <div className="grid grid-cols-3 gap-6 text-right">

                      <div>

                        <p className="text-xs text-slate-400">
                          QUEUE
                        </p>

                        <p className="font-bold">
                          {count}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-slate-400">
                          WAIT
                        </p>

                        <p className="font-bold">
                          {service.waitingTime || 0} min
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-slate-400">
                          OFFICERS
                        </p>

                        <p className="font-bold">
                          {service.availableOfficers || 0}/
                          {service.totalOfficers || 0}
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="mt-5">

                    <div className="mb-2 flex justify-between text-xs">

                      <span className="font-semibold text-slate-500">
                        Demand
                      </span>

                      <span className="font-bold text-slate-700">
                        {demand}%
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${demand}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* ANALYTICS GRID */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* QUEUE DISTRIBUTION */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold">
              Queue Distribution
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current token status across the platform.
            </p>

            <div className="mt-6 space-y-4">

              <MetricRow
                label="Waiting"
                value={waitingTokens.length}
                total={Math.max(totalPeopleToday, 1)}
              />

              <MetricRow
                label="Serving"
                value={servingTokens.length}
                total={Math.max(totalPeopleToday, 1)}
              />

              <MetricRow
                label="Completed"
                value={completedTokens.length}
                total={Math.max(totalPeopleToday, 1)}
              />

            </div>

          </section>

          {/* AI RECOMMENDATION */}

          <section className="rounded-3xl border border-green-100 bg-green-50 p-6">

            <p className="text-sm font-bold uppercase tracking-wider text-green-800">
              🤖 AI Resource Recommendation
            </p>

            <h2 className="mt-2 text-2xl font-bold text-green-950">
              Optimize Officer Allocation
            </h2>

            <p className="mt-3 text-sm leading-6 text-green-700">

              QueueLess India can analyze service demand,
              waiting time and officer availability to recommend
              where additional staff should be assigned.

            </p>

            <div className="mt-5 rounded-2xl bg-white p-5">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Current Recommendation
              </p>

              {totalWaiting >= 10 ? (

                <div>

                  <p className="mt-2 text-lg font-bold text-amber-800">
                    ⚠️ High queue demand detected
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Consider assigning an additional officer
                    to the highest-demand service.
                  </p>

                </div>

              ) : (

                <div>

                  <p className="mt-2 text-lg font-bold text-green-800">
                    ✓ Current staffing is sufficient
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    No immediate additional officer allocation
                    is required.
                  </p>

                </div>

              )}

            </div>

          </section>

        </div>

        {/* DEMO DATA NOTICE */}

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">

          <p className="font-bold text-amber-900">
            🎬 SIH Prototype Analytics
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-700">

            Current analytics are generated from live queue and
            service data. In the production version, historical
            queue records will be used to train demand forecasting
            and resource optimization models.

          </p>

        </div>

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

function MetricRow({
  label,
  value,
  total,
}) {
  const percentage = Math.round(
    (value / total) * 100
  );

  return (
    <div>

      <div className="flex justify-between">

        <span className="text-sm font-semibold text-slate-600">
          {label}
        </span>

        <span className="text-sm font-bold">
          {value}
        </span>

      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

export default AdminDashboard;