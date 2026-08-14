import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  User,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const API_URL = "https://queueless-india-a2ju.onrender.com/api";

function TokenPage() {
  const params = useParams();

const id = params.id || params.serviceId;
  const location = useLocation();

  const [service, setService] = useState(location.state?.service || null);
  const [citizenName, setCitizenName] = useState("");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(!service);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD SERVICE
  // ==========================================

  useEffect(() => {
  if (service || !id) {
    return;
  }

  const loadService = async () => {
    try {
      setServiceLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/services/${id}`
      );

      const data = await response.json();

      if (!response.ok || !data.service) {
        throw new Error(
          data.message || "Service not found"
        );
      }

      setService(data.service);
    } catch (err) {
      console.error("Load service error:", err);
      setError("Unable to load this service.");
    } finally {
      setServiceLoading(false);
    }
  };

  loadService();
}, [id, service]);

  // ==========================================
  // CREATE TOKEN
  // ==========================================

  const handleCreateToken = async (event) => {
    event.preventDefault();

    setError("");

    if (!citizenName.trim()) {
      setError("Please enter your name.");
      return;
    }

    // Support both MongoDB _id and id
    const serviceId = service?._id || service?.id || id;

    if (!serviceId) {
      setError(
        "Service ID is missing. Please go back and select the service again."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/queue/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            citizenName: citizenName.trim(),
            serviceId: serviceId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create token"
        );
      }

      localStorage.setItem(
  "queueless_user_token",
  JSON.stringify(data.token)
);

setToken(data.token);
    } catch (err) {
      console.error("Create token error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (serviceLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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
  // ERROR / SERVICE NOT FOUND
  // ==========================================

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-20 text-center">
        <h1 className="text-3xl font-bold">
          Service not found
        </h1>

        <p className="mt-3 text-slate-500">
          {error || "We couldn't find this government service."}
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
  // TOKEN CREATED
  // ==========================================

  if (token) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-10">

          <Link
            to={`/services/${service._id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Service
          </Link>

          <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-9 w-9 text-green-600" />
              </div>

              <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-green-700">
                Token Generated
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Your Digital Token
              </h1>

              <div className="mt-8 rounded-3xl bg-blue-700 p-8 text-center text-white">

                <p className="text-sm font-semibold text-blue-200">
                  YOUR TOKEN NUMBER
                </p>

                <p className="mt-2 text-6xl font-black">
                  {token.tokenNumber}
                </p>

              </div>

              <div className="mt-6 space-y-3 text-left">

                <InfoRow
                  icon={<User />}
                  label="Citizen"
                  value={token.citizenName}
                />

                <InfoRow
                  icon={<FileText />}
                  label="Service"
                  value={service.name}
                />

                <InfoRow
                  icon={<Clock3 />}
                  label="Average Service"
                  value={`${service.averageTime} min`}
                />

                <InfoRow
                  icon={<MapPin />}
                  label="Office"
                  value={service.office}
                />

              </div>

              <Link
                to={`/queue/${token._id}`}
                state={{
                  token,
                  service,
                }}
                className="mt-7 block w-full rounded-xl bg-blue-700 py-3.5 font-semibold text-white hover:bg-blue-800"
              >
                Track Live Queue
              </Link>

              <Link
                to="/services"
                className="mt-3 block w-full rounded-xl border border-slate-300 bg-white py-3.5 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to Services
              </Link>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TOKEN FORM
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-4xl px-6 py-10">

        <Link
          to={`/services/${service._id || id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Service
        </Link>

        <div className="mt-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Digital Queue
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Get Your Digital Token
          </h1>

          <p className="mt-3 text-slate-600">
            Enter your details to join the queue without
            waiting physically at the office.
          </p>

        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* FORM */}

          <div className="lg:col-span-2">

            <div className="rounded-3xl border bg-white p-8 shadow-sm">

              <div className="rounded-2xl bg-blue-50 p-5">

                <p className="text-sm font-semibold text-blue-700">
                  SELECTED SERVICE
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {service.name}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {service.department}
                </p>

              </div>

              <form
                onSubmit={handleCreateToken}
                className="mt-8"
              >

                <label className="text-sm font-semibold text-slate-700">
                  Citizen Name
                </label>

                <input
                  type="text"
                  value={citizenName}
                  onChange={(event) =>
                    setCitizenName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

                {error && (
                  <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-blue-700 py-4 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Generating Token..."
                    : "Generate Digital Token"}
                </button>

              </form>

              <div className="mt-8 rounded-2xl bg-slate-50 p-6">

                <h3 className="font-bold">
                  Before you continue
                </h3>

                <div className="mt-4 space-y-4 text-sm text-slate-600">

                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Keep your required documents ready.
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock3 className="h-5 w-5 text-blue-600" />
                    You can track your queue position online.
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Arrive before your token is called.
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* SERVICE INFO */}

          <div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">

              <h2 className="font-bold">
                Service Information
              </h2>

              <div className="mt-5 space-y-3">

                <InfoRow
                  icon={<Clock3 />}
                  label="Average Time"
                  value={`${service.averageTime} min`}
                />

                <InfoRow
                  icon={<MapPin />}
                  label="Office"
                  value={service.office}
                />

                <InfoRow
                  icon={<User />}
                  label="Department"
                  value={service.department}
                />

              </div>

            </div>

            <div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">

              <h2 className="font-bold">
                Required Documents
              </h2>

              <div className="mt-4 space-y-3">

                {service.documents?.map((document) => (
                  <div
                    key={document}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    {document}
                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

// ==========================================
// INFO ROW
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

      <span className="max-w-[180px] truncate text-right text-sm font-bold text-slate-900">
        {value}
      </span>

    </div>
  );
}

export default TokenPage;