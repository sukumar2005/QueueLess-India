import {
  Search,
  Clock3,
  Users,
  ArrowRight,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function Services() {
  const [search, setSearch] = useState("");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/services`);

        if (!response.ok) {
          throw new Error("Failed to load services");
        }

        const data = await response.json();

        setServices(data.services || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load government services.");
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const filteredServices = services.filter(
    (service) =>
      service.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      service.department
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* HEADER */}

        <div className="max-w-3xl">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Citizen Services
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Find a Government Service
          </h1>

          <p className="mt-4 text-slate-600">
            Search for a service and discover the documents,
            department, office and current queue information.
          </p>

        </div>

        {/* SEARCH */}

        <div className="mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

          <div className="flex items-center gap-3 px-4 py-3">

            <Search className="h-5 w-5 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search government services..."
              className="w-full bg-transparent outline-none"
            />

          </div>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="mt-10 rounded-2xl bg-white p-12 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

            <p className="mt-4 text-slate-500">
              Loading government services...
            </p>

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

            <h3 className="font-semibold text-red-800">
              Unable to load services
            </h3>

            <p className="mt-2 text-sm text-red-600">
              Make sure the QueueLess India backend is running.
            </p>

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

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {service.department}
                    </span>

                    <h2 className="mt-4 text-xl font-bold text-slate-900">
                      {service.name}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      {service.office}
                    </p>

                  </div>

                  <span className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">

                    <span className="h-2 w-2 rounded-full bg-green-500" />

                    {service.available
                      ? "Open"
                      : "Closed"}

                  </span>

                </div>

                <p className="mt-4 leading-6 text-slate-600">
                  Government service available through
                  QueueLess India.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-slate-50 p-4">

                    <Users className="h-4 w-4 text-blue-700" />

                    <p className="mt-2 text-lg font-bold">
                      Live
                    </p>

                    <p className="text-xs text-slate-500">
                      Queue status
                    </p>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">

                    <Clock3 className="h-4 w-4 text-blue-700" />

                    <p className="mt-2 text-lg font-bold">
                      {service.averageTime} min
                    </p>

                    <p className="text-xs text-slate-500">
                      Avg. service
                    </p>

                  </div>

                </div>

                <Link
                  to={`/services/${service._id}`}
                  state={{ service }}
                  className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 font-semibold text-white hover:bg-blue-800"
                >
                  View Service

                  <ArrowRight className="h-4 w-4" />

                </Link>

              </div>

            ))}

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredServices.length === 0 && (
            <div className="mt-10 rounded-2xl bg-white p-12 text-center">

              <h3 className="text-lg font-semibold">
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