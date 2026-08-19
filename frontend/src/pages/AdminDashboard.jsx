import {
  ArrowLeft,
  BarChart3,
  Building2,
  Clock3,
  MessageSquare,
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
  const [hospitals, setHospitals] = useState([]);
  const [offices, setOffices] = useState([]);

  const [analytics, setAnalytics] = useState({
    totalServices: 0,
    totalHospitals: 0,
    totalOffices: 0,

    totalDoctors: 0,
    totalOfficers: 0,

    activeDoctors: 0,
    activeOfficers: 0,

    totalTokens: 0,
    totalWaitingTokens: 0,
    totalServingTokens: 0,
    totalCompletedTokens: 0,
    totalSkippedTokens: 0,

    onlineTokens: 0,
    offlineTokens: 0,

    todayTokenCount: 0,
    todayCompletedTokens: 0,

    completionRate: 0,
    averageServiceTime: 0,
    averageWaitingTime: 0,

    unreadNotifications: 0,
  });

  const [dailyStats, setDailyStats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  const loadDashboard = async () => {
    try {
      setError("");

      const session = JSON.parse(
        localStorage.getItem("queueless_session") || "{}"
      );

      const [
        analyticsResponse,
        servicesResponse,
        queueResponse,
        hospitalsResponse,
        officesResponse,
        complaintsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/analytics/summary`),

        fetch(`${API_URL}/services`),

        fetch(`${API_URL}/queue/status`),

        fetch(`${API_URL}/hospitals`),

        fetch(`${API_URL}/government-offices`),

        fetch(`${API_URL}/complaints`, {
          headers: {
            Authorization: `Bearer ${session.token || ""}`,
          },
        }),
      ]);

      if (!analyticsResponse.ok) {
        throw new Error("Unable to load analytics");
      }

      if (!servicesResponse.ok) {
        throw new Error("Unable to load services");
      }

      if (!queueResponse.ok) {
        throw new Error("Unable to load queue");
      }

      if (!hospitalsResponse.ok) {
        throw new Error("Unable to load hospitals");
      }

      if (!officesResponse.ok) {
        throw new Error("Unable to load government offices");
      }

      const analyticsData = await analyticsResponse.json();
      const servicesData = await servicesResponse.json();
      const queueData = await queueResponse.json();
      const hospitalsData = await hospitalsResponse.json();
      const officesData = await officesResponse.json();

      const complaintsData = complaintsResponse.ok
        ? await complaintsResponse.json()
        : { complaints: [] };

      setServices(servicesData.services || []);

      setQueue(queueData.queue || []);

      setHospitals(hospitalsData.hospitals || []);

      setOffices(officesData.offices || []);

      setNotifications(
        analyticsData.recentNotifications || []
      );

      setAnalytics(
        analyticsData.summary || {}
      );

      setDailyStats(
        analyticsData.dailyStats || []
      );

      setComplaints(
        complaintsData.complaints || []
      );
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        "Unable to load administration data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD + AUTO REFRESH
  // =====================================================

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

  // =====================================================
  // QUEUE DATA
  // =====================================================

  const waitingTokens = queue.filter(
    (token) => token.status === "waiting"
  );

  const servingTokens = queue.filter(
    (token) => token.status === "serving"
  );

  const completedTokens = queue.filter(
    (token) => token.status === "completed"
  );

  const totalPeopleToday = queue.length;

  const totalWaiting = waitingTokens.length;

  // =====================================================
  // ANALYTICS DATA
  // =====================================================

  const activeDoctors =
    analytics.activeDoctors || 0;

  const activeOfficers =
    analytics.activeOfficers || 0;

  const totalDoctors =
    analytics.totalDoctors || 0;

  const totalOfficers =
    analytics.totalOfficers || 0;

  const averageWait =
    analytics.averageWaitingTime || 0;

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const unreadNotifications =
    notifications.filter(
      (item) => !item.read
    ).length;

  // =====================================================
  // COMPLAINTS
  // =====================================================

  const openComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === "Open"
    ).length;

  const inProgressComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === "In Progress"
    ).length;

  // =====================================================
  // SERVICE QUEUE COUNT
  // =====================================================

  const getServiceCount = (serviceId) => {
    return queue.filter(
      (token) =>
        token.service?._id?.toString() ===
        serviceId?.toString()
    ).length;
  };

  // =====================================================
  // LOADING
  // =====================================================

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

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

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

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* =================================================
            OVERVIEW
        ================================================= */}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<Users />}
            title="Total Queue"
            value={
              analytics.todayTokenCount || 0
            }
            description="Active tokens"
          />

          <StatCard
            icon={<Clock3 />}
            title="Waiting"
            value={
              analytics.totalWaitingTokens || 0
            }
            description="Citizens waiting"
          />

          <StatCard
            icon={<UserCheck />}
            title="Active Staff"
            value={`${activeDoctors + activeOfficers}/${Math.max(
              totalDoctors + totalOfficers,
              1
            )}`}
            description="Doctors & officers available"
          />

          <StatCard
            icon={<TrendingUp />}
            title="Avg. Wait"
            value={`${averageWait} min`}
            description="Across services"
          />

        </div>

        {/* =================================================
            PLATFORM SUMMARY
        ================================================= */}

        <section className="mt-8 grid gap-4 lg:grid-cols-4">

          {/* HEALTHCARE */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Healthcare Units
            </p>

            <p className="mt-3 text-3xl font-black text-slate-900">
              {hospitals.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Hospitals monitored
            </p>

          </div>

          {/* GOVERNMENT OFFICES */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Government Offices
            </p>

            <p className="mt-3 text-3xl font-black text-slate-900">
              {offices.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Office counters active
            </p>

          </div>

          {/* NOTIFICATIONS */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Notifications
            </p>

            <p className="mt-3 text-3xl font-black text-slate-900">
              {unreadNotifications}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Unread status updates
            </p>

          </div>

          {/* COMPLAINTS */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Complaints
            </p>

            <p className="mt-3 text-3xl font-black text-slate-900">
              {openComplaints}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Open issues ({inProgressComplaints} in progress)
            </p>

          </div>

        </section>

        {/* =================================================
            PHASE 15 - PERFORMANCE ANALYTICS
        ================================================= */}

        <section className="mt-8">

          <div className="mb-4">

            <h2 className="text-xl font-bold text-slate-900">
              Performance Analytics
            </h2>

            <p className="text-sm text-slate-500">
              Real-time queue and service performance.
            </p>

          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            <StatCard
              icon={<Clock3 />}
              title="Avg. Waiting Time"
              value={`${analytics.averageWaitingTime || 0} min`}
              description="Token creation to service start"
            />

            <StatCard
              icon={<TrendingUp />}
              title="Avg. Service Time"
              value={`${analytics.averageServiceTime || 0} min`}
              description="Service start to completion"
            />

            <StatCard
              icon={<UserCheck />}
              title="Completion Rate"
              value={`${analytics.completionRate || 0}%`}
              description="Completed vs processed tokens"
            />

            <StatCard
              icon={<Users />}
              title="Today's Completed"
              value={
                analytics.todayCompletedTokens || 0
              }
              description="Completed tokens today"
            />

          </div>

        </section>

        {/* =================================================
            ONLINE / OFFLINE TOKENS
        ================================================= */}

        <section className="mt-6 grid gap-4 md:grid-cols-2">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Online Tokens
            </p>

            <p className="mt-2 text-3xl font-black text-blue-700">
              {analytics.onlineTokens || 0}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Citizens who booked digitally
            </p>

          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Offline Tokens
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {analytics.offlineTokens || 0}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Tokens created by staff
            </p>

          </div>

        </section>

        {/* =================================================
            7 DAY ANALYTICS
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-slate-900">
              7-Day Queue Trend
            </h2>

            <p className="text-sm text-slate-500">
              Daily token activity across QueueLess India.
            </p>

          </div>

          <div className="space-y-4">

            {dailyStats.length === 0 ? (
              <p className="text-sm text-slate-500">
                No daily analytics available.
              </p>
            ) : (
              dailyStats.map((day) => (

                <div
                  key={day.date}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >

                  <div className="flex items-center justify-between">

                    <span className="font-semibold text-slate-700">
                      {day.date}
                    </span>

                    <span className="text-sm font-bold text-slate-900">
                      {day.total} tokens
                    </span>

                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-3 text-center">

                    <div>
                      <p className="text-xs text-slate-400">
                        Waiting
                      </p>

                      <p className="font-bold">
                        {day.waiting}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Serving
                      </p>

                      <p className="font-bold text-blue-700">
                        {day.serving}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Completed
                      </p>

                      <p className="font-bold text-green-700">
                        {day.completed}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Skipped
                      </p>

                      <p className="font-bold text-red-700">
                        {day.skipped}
                      </p>
                    </div>

                  </div>

                </div>

              ))
            )}

          </div>

        </section>

        {/* =================================================
            SYSTEM STATUS
        ================================================= */}

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

        {/* =================================================
            SERVICE PERFORMANCE
        ================================================= */}

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

            {services.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No services available.
              </p>
            ) : (
              services.map((service) => {

                const count =
                  getServiceCount(service._id);

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
              })
            )}

          </div>

        </section>

        {/* =================================================
            QUEUE DISTRIBUTION + AI
        ================================================= */}

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
                total={Math.max(
                  totalPeopleToday,
                  1
                )}
              />

              <MetricRow
                label="Serving"
                value={servingTokens.length}
                total={Math.max(
                  totalPeopleToday,
                  1
                )}
              />

              <MetricRow
                label="Completed"
                value={completedTokens.length}
                total={Math.max(
                  totalPeopleToday,
                  1
                )}
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

        {/* =================================================
            DEMO DATA NOTICE
        ================================================= */}

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

        {/* =================================================
            COMPLAINTS MANAGEMENT
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700">

                <MessageSquare className="h-5 w-5" />

              </div>

              <div>

                <h2 className="text-xl font-bold">
                  Complaints
                </h2>

                <p className="text-sm text-slate-500">
                  Monitor citizen issues
                </p>

              </div>

            </div>

            <Link
              to="/complaints"
              className="rounded-xl bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              View All
            </Link>

          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

              <p className="text-sm font-semibold text-slate-600">
                Open
              </p>

              <p className="mt-2 text-2xl font-black text-red-700">
                {openComplaints}
              </p>

            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

              <p className="text-sm font-semibold text-slate-600">
                In Progress
              </p>

              <p className="mt-2 text-2xl font-black text-orange-700">
                {inProgressComplaints}
              </p>

            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

              <p className="text-sm font-semibold text-slate-600">
                Total
              </p>

              <p className="mt-2 text-2xl font-black text-blue-700">
                {complaints.length}
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

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

// =====================================================
// METRIC ROW
// =====================================================

function MetricRow({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.min(
          Math.round(
            (value / total) * 100
          ),
          100
        )
      : 0;

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