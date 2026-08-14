import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Users,
  UserCheck,
  ArrowRight,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { predictQueue } from "../utils/queuePrediction";

const API_URL = "https://queueless-india-a2ju.onrender.com/api";

function ServiceDetails() {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const serviceId = service?._id || service?.id;

  // ==========================================
  // LOAD SERVICE
  // ==========================================

  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/services/${id}`
        );

        if (!response.ok) {
          throw new Error("Service not found");
        }

        const data = await response.json();

        setService(data.service);
      } catch (err) {
        console.error("Service error:", err);
        setError("Service not found");
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id]);

  // ==========================================
  // LOAD LIVE QUEUE
  // ==========================================

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadQueue = async () => {
      try {
        const response = await fetch(
          `${API_URL}/queue/status?serviceId=${id}`
        );

        if (!response.ok) {
          throw new Error("Queue unavailable");
        }

        const data = await response.json();

        setQueueData(data);
      } catch (err) {
        console.error("Queue error:", err);
      }
    };

    loadQueue();

    const interval = setInterval(() => {
      loadQueue();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [id]);

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

          <p className="mt-4 text-slate-500">
            Loading service...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // SERVICE NOT FOUND
  // ==========================================

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-20 text-center">

        <h1 className="text-3xl font-bold">
          Service not found
        </h1>

        <p className="mt-3 text-slate-500">
          We couldn't find this government service.
        </p>

        <Link
          to="/services"
          className="mt-6 inline-block font-semibold text-blue-700"
        >
          Back to Services
        </Link>

      </div>
    );
  }

  // ==========================================
  // AI QUEUE PREDICTION
  // ==========================================

  const prediction = predictQueue({
    peopleWaiting:
      queueData?.peopleWaiting ??
      service.peopleWaiting ??
      0,

    averageServiceTime:
      service.averageTime || 15,

    availableOfficers:
      service.availableOfficers || 1,

    totalOfficers:
      service.totalOfficers || 1,
  });

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* BACK */}

        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Link>

        {/* HEADER */}

        <div className="mt-8 rounded-3xl bg-blue-700 p-8 text-white md:p-10">

          <div className="flex flex-col justify-between gap-6 md:flex-row">

            <div>

              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                Government Service
              </span>

              <h1 className="mt-5 text-4xl font-bold">
                {service.name}
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-blue-100">
                Apply for and access this government service
                through QueueLess India.
              </p>

            </div>

            <div
              className={`flex h-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white ${
                service.available
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            >

              <span className="h-2 w-2 rounded-full bg-white" />

              {service.available ? "Open" : "Closed"}

            </div>

          </div>

        </div>

        {/* INFORMATION */}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* LEFT SIDE */}

          <div className="space-y-6 lg:col-span-2">

            {/* DOCUMENTS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-7">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                  <FileText className="h-5 w-5" />

                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    Documents Required
                  </h2>

                  <p className="text-sm text-slate-500">
                    Keep these documents ready before visiting.
                  </p>

                </div>

              </div>

              <div className="mt-6 space-y-3">

                {service.documents?.map((document) => (

                  <div
                    key={document}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
                  >

                    <CheckCircle2 className="h-5 w-5 text-green-600" />

                    <span className="font-medium text-slate-700">
                      {document}
                    </span>

                  </div>

                ))}

              </div>

            </section>

            {/* OFFICE */}

            <section className="rounded-2xl border border-slate-200 bg-white p-7">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                  <MapPin className="h-5 w-5" />

                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    Office Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Where you need to visit.
                  </p>

                </div>

              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">

                <h3 className="font-bold">
                  {service.office}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {service.department}
                </p>

                <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">

                  <span>
                    🕘 9:00 AM – 5:00 PM
                  </span>

                  <span>
                    📍 Coimbatore
                  </span>

                  <span>
                    📅 Monday – Friday
                  </span>

                </div>

              </div>

            </section>

          </div>

          {/* RIGHT SIDE */}

          <div>

            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

              {/* QUEUE HEADER */}

              <h2 className="text-xl font-bold">
                Live Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current service information
              </p>

              {/* QUEUE INFORMATION */}

              <div className="mt-6 space-y-4">

                <InfoRow
                  icon={<Users />}
                  label="People Waiting"
                  value={
                    queueData?.peopleWaiting ??
                    service.peopleWaiting ??
                    0
                  }
                />

                <InfoRow
                  icon={<Users />}
                  label="Queue Status"
                  value={
                    service.available
                      ? "Open"
                      : "Closed"
                  }
                />

                <InfoRow
                  icon={<Clock3 />}
                  label="Average Service"
                  value={`${service.averageTime || 15} min`}
                />

                <InfoRow
                  icon={<UserCheck />}
                  label="Department"
                  value={service.department}
                />

              </div>

              {/* ==================================
                  AI QUEUE PREDICTION
                  ================================== */}

              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">

                <div className="flex items-center gap-2">

                  <span className="text-xl">
                    🤖
                  </span>

                  <p className="text-sm font-bold uppercase tracking-wider text-green-800">
                    AI Queue Prediction
                  </p>

                </div>

                <p className="mt-3 text-sm font-semibold text-green-800">
                  Recommended Visit Time
                </p>

                <p className="mt-1 text-3xl font-black text-green-950">
                  {prediction.recommendedTime}
                </p>

                <p className="mt-1 text-sm text-green-700">
                  Lower predicted queue during this period.
                </p>

                {/* AI METRICS */}

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-white p-4">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Predicted Wait
                    </p>

                    <p className="mt-1 text-xl font-black text-slate-900">
                      {prediction.predictedWait} min
                    </p>

                  </div>

                  <div className="rounded-xl bg-white p-4">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Demand
                    </p>

                    <p className="mt-1 text-xl font-black text-slate-900">
                      {prediction.demandLevel}
                    </p>

                  </div>

                </div>

                {/* PEAK PERIOD */}

                <div className="mt-4 rounded-xl bg-amber-50 p-4">

                  <p className="font-bold text-amber-900">
                    ⚠️ Peak Demand
                  </p>

                  <p className="mt-1 text-sm text-amber-700">
                    {prediction.peakPeriod}
                  </p>

                </div>

                {/* AI RECOMMENDATION */}

                <p className="mt-4 text-sm leading-6 text-green-800">
                  {prediction.recommendation}
                </p>

              </div>
              

              {/* TOKEN */}

             {/* TOKEN */}

<Link
  to={`/token/${serviceId}`}
  state={{
    service,
    serviceId,
  }}
  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 font-semibold text-white hover:bg-blue-800"
>
  Get Digital Token

  <ArrowRight className="h-4 w-4" />
</Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

// ==========================================
// INFO ROW COMPONENT
// ==========================================

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

export default ServiceDetails;