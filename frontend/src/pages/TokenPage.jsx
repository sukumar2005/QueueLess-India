import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function TokenPage() {
  const { id } = useParams();
  const location = useLocation();

  const service = location.state?.service;

  const [citizenName, setCitizenName] = useState("");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetToken = async (event) => {
    event.preventDefault();

    if (!citizenName.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/queue/token`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            citizenName: citizenName.trim(),
            serviceId: id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create token"
        );
      }

      localStorage.setItem(
  "queueless_user_token",
  JSON.stringify(data.token)
);

setToken(data.token);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return (
      <TokenSuccess
        token={token}
        service={service}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-3xl px-6 py-10">

        <Link
          to={`/services/${id}`}
          state={{ service }}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Service
        </Link>

        <div className="mt-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Digital Token
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Join the Queue
          </h1>

          <p className="mt-3 text-slate-600">
            Get your digital token without waiting at the office.
          </p>

        </div>

        <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">

          <div className="rounded-2xl bg-blue-50 p-5">

            <p className="text-sm font-semibold text-blue-700">
              SELECTED SERVICE
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-900">
              {service?.name || "Government Service"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {service?.department || "Government Department"}
            </p>

          </div>

          <form
            onSubmit={handleGetToken}
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
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {error && (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">

              <h3 className="font-bold">
                Before you continue
              </h3>

              <div className="mt-4 space-y-3 text-sm text-slate-600">

                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>
                    Keep your required documents ready.
                  </span>
                </div>

                <div className="flex gap-3">
                  <Clock3 className="h-5 w-5 text-blue-600" />
                  <span>
                    You can track your queue position online.
                  </span>
                </div>

                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>
                    Arrive before your token is called.
                  </span>
                </div>

              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-xl bg-blue-700 py-4 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Generating Token..."
                : "Get Digital Token"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

function TokenSuccess({ token, service }) {
  return (
    <div className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-3xl px-6 py-12">

        <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">

            <CheckCircle2 className="h-9 w-9 text-green-600" />

          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-green-600">
            Token Generated
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            You're in the queue!
          </h1>

          <div className="mt-8 rounded-3xl bg-blue-700 p-8 text-white">

            <p className="text-sm font-semibold text-blue-200">
              YOUR TOKEN
            </p>

            <p className="mt-2 text-6xl font-black">
              {token.tokenNumber}
            </p>

          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl bg-slate-50 p-5">

              <Users className="mx-auto h-6 w-6 text-blue-700" />

              <p className="mt-2 text-2xl font-bold">
                Waiting
              </p>

              <p className="text-sm text-slate-500">
                Your position will update live.
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <Clock3 className="mx-auto h-6 w-6 text-blue-700" />

              <p className="mt-2 text-2xl font-bold">
                ~{service?.averageTime || 15} min
              </p>

              <p className="text-sm text-slate-500">
                Average service time
              </p>

            </div>

          </div>

          <div className="mt-6 rounded-2xl bg-blue-50 p-5">

            <p className="font-bold text-blue-900">
              {service?.name}
            </p>

            <p className="mt-1 text-sm text-blue-700">
              {service?.office}
            </p>

          </div>

          <Link
            to="/live-queue"
            className="mt-7 block w-full rounded-xl bg-slate-900 py-4 font-semibold text-white hover:bg-slate-800"
          >
            Track Live Queue
          </Link>

          <Link
            to="/services"
            className="mt-3 block text-sm font-semibold text-blue-700"
          >
            Browse Other Services
          </Link>

        </div>

      </div>

    </div>
  );
}

export default TokenPage;