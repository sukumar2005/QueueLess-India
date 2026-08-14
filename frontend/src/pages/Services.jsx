import {
  Search,
  Clock3,
  ArrowRight,
  Building2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "https://queueless-india-a2ju.onrender.com/api";

function Services() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/services`);

        if (!response.ok) {
          throw new Error("Failed to load services");
        }

        const data = await response.json();

        setServices(data.services || []);
      } catch (err) {
        console.error("Services loading error:", err);
        setError("Unable to load government services.");
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const filteredServices = services.filter((service) =>
    `${service.name} ${service.department} ${service.office}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* HEADER */}

        <div className="max-w-4xl">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Citizen Services
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900 md:text-5xl">
            Find a Government Service
          </h1>

          <p className="mt-4 text-slate-600">
            Search for a service and discover the documents,
            department, office and current service information.
          </p>

        </div>

        {/* SEARCH */}

        <div className="mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

          <div className="flex items-center gap-3 px-4 py-3">

            <Search className="h-5 w-5 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search government services..."
              className="w-full bg-transparent text-slate-700 outline-none"
            />

          </div>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="mt-12 flex justify-center">

            <div className="text-center">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

              <p className="mt-4 text-slate-500">
                Loading government services...
              </p>

            </div>

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

            <h3 className="text-lg font-bold text-red-800">
              Unable to load services
            </h3>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white"
            >
              Try Again
            </button>

          </div>
        )}

        {/* SERVICES */}

        {!loading && !error && (
          <div className="mt-10 grid gap-6 md:grid-cols-2">

            {filteredServices.map((service) => (

              <div
                key={service._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                {/* TOP */}

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Government Service
                    </span>

                    <h2 className="mt-4 text-xl font-bold text-slate-900">
                      {service.name}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      {service.department}
                    </p>

                  </div>

                  <span className="flex shrink-0 items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">

                    <span className="h-2 w-2 rounded-full bg-green-500" />

                    {service.available ? "Open" : "Closed"}

                  </span>

                </div>

                {/* OFFICE */}

                <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4">

                  <Building2 className="h-5 w-5 text-blue-700" />

                  <div>

                    <p className="text-xs text-slate-500">
                      Office
                    </p>

                    <p className="font-semibold text-slate-700">
                      {service.office}
                    </p>

                  </div>

                </div>

                {/* INFORMATION */}

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-slate-50 p-4">

                    <Clock3 className="h-4 w-4 text-blue-700" />

                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {service.averageTime} min
                    </p>

                    <p className="text-xs text-slate-500">
                      Average service time
                    </p>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-sm font-semibold text-blue-700">
                      Documents
                    </p>

                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {service.documents?.length || 0}
                    </p>

                    <p className="text-xs text-slate-500">
                      Required documents
                    </p>

                  </div>

                </div>

                {/* BUTTON */}

                <Link
                  to={`/services/${service._id}`}
                  className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 font-semibold text-white transition hover:bg-blue-800"
                >
                  View Service

                  <ArrowRight className="h-4 w-4" />

                </Link>

              </div>

            ))}

          </div>
        )}

        {/* NO RESULTS */}

        {!loading &&
          !error &&
          filteredServices.length === 0 && (
            <div className="mt-10 rounded-2xl bg-white p-12 text-center">

              <h3 className="text-lg font-semibold text-slate-900">
                No service found
              </h3>

              <p className="mt-2 text-slate-500">
                Try searching for another government service.
              </p>

            </div>
          )}

      </div>

    </div>
  );
}

export default Services;