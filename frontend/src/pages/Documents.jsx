import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Phone,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://queueless-india-a2ju.onrender.com/api";

function Documents() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (category !== "All") {
          params.set("category", category);
        }

        const response = await fetch(
          `${API_URL}/services/documents?${params.toString()}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load documents"
          );
        }

        setServices(data.services || []);
        setCategories(data.categories || ["All"]);
        setSelectedService((current) => {
          if (!current) {
            return data.services?.[0] || null;
          }

          return (
            data.services?.find(
              (service) => service._id === current._id
            ) ||
            data.services?.[0] ||
            null
          );
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [search, category]);

  const documentCount = selectedService?.documents?.length || 0;

  const stateSupport = useMemo(
    () =>
      selectedService?.stateInfo
        ? Object.keys(selectedService.stateInfo)
        : [],
    [selectedService]
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <Link to="/" className="font-semibold text-blue-700">
          Back to Home
        </Link>

        <div className="mt-6 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Documents & Certificates
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Document / Certificate Information Center
          </h1>
          <p className="mt-3 text-slate-600">
            Search services, check required documents and understand
            where to apply.
          </p>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search certificate or government service..."
                className="w-full bg-transparent outline-none"
              />
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 outline-none"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <p className="mt-8 text-slate-500">
            Loading document information...
          </p>
        )}

        {!loading && !error && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="px-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                Search Results
              </h2>

              <div className="mt-3 space-y-2">
                {services.map((service) => (
                  <button
                    key={service._id}
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className={`w-full rounded-2xl p-4 text-left ${
                      selectedService?._id === service._id
                        ? "bg-blue-700 text-white"
                        : "bg-slate-50 text-slate-700 hover:bg-blue-50"
                    }`}
                  >
                    <p className="font-bold">{service.name}</p>
                    <p
                      className={`mt-1 text-sm ${
                        selectedService?._id === service._id
                          ? "text-blue-100"
                          : "text-slate-500"
                      }`}
                    >
                      {service.department}
                    </p>
                  </button>
                ))}
              </div>

              {services.length === 0 && (
                <p className="p-6 text-center text-sm text-slate-500">
                  No document or certificate found.
                </p>
              )}
            </section>

            {selectedService && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {selectedService.category || "Government Service"}
                    </span>
                    <h2 className="mt-4 text-3xl font-bold text-slate-900">
                      {selectedService.name}
                    </h2>
                    <p className="mt-3 text-slate-600">
                      {selectedService.purpose ||
                        "Citizen service information and document checklist."}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-3xl font-black text-slate-900">
                      {documentCount}
                    </p>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Required documents
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Info
                    icon={<Building2 />}
                    label="Department"
                    value={selectedService.department}
                  />
                  <Info
                    icon={<Building2 />}
                    label="Office"
                    value={selectedService.office}
                  />
                  <Info
                    icon={<UserRound />}
                    label="Officer / Role"
                    value={
                      selectedService.officerRole || "Service Officer"
                    }
                  />
                  <Info
                    icon={<Clock3 />}
                    label="Processing Time"
                    value={
                      selectedService.processingTime ||
                      `Approximately ${selectedService.averageTime} minutes at counter`
                    }
                  />
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                  <Panel title="Required Documents">
                    <div className="space-y-3">
                      {selectedService.documents?.map((document) => (
                        <div
                          key={document}
                          className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-slate-700">
                            {document}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Panel>

                  <Panel title="Documents Checklist">
                    <div className="space-y-3">
                      {selectedService.documents?.map((document) => (
                        <label
                          key={document}
                          className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-700"
                        >
                          <input type="checkbox" className="h-4 w-4" />
                          {document}
                        </label>
                      ))}
                    </div>
                  </Panel>
                </div>

                <Panel title="Application Steps" className="mt-6">
                  <ol className="space-y-3">
                    {selectedService.applicationSteps?.map(
                      (step, index) => (
                        <li
                          key={step}
                          className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      )
                    )}
                  </ol>
                </Panel>

                <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <h3 className="font-bold text-blue-900">
                    How to Apply
                  </h3>
                  <ol className="mt-4 space-y-3">
                    <li className="flex gap-3 text-sm text-blue-900">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                        1
                      </span>
                      <span>
                        <strong>Prepare Documents:</strong> Gather all required documents mentioned above
                      </span>
                    </li>
                    <li className="flex gap-3 text-sm text-blue-900">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                        2
                      </span>
                      <span>
                        <strong>Visit Office:</strong> Go to the {selectedService.office} during office hours
                      </span>
                    </li>
                    <li className="flex gap-3 text-sm text-blue-900">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                        3
                      </span>
                      <span>
                        <strong>Get Token:</strong> Take an online or offline token using QueueLess
                      </span>
                    </li>
                    <li className="flex gap-3 text-sm text-blue-900">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                        4
                      </span>
                      <span>
                        <strong>Wait for Your Turn:</strong> Track your position in the live queue
                      </span>
                    </li>
                    <li className="flex gap-3 text-sm text-blue-900">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                        5
                      </span>
                      <span>
                        <strong>Submit Application:</strong> When called, proceed to the counter and submit your documents
                      </span>
                    </li>
                    <li className="flex gap-3 text-sm text-blue-900">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                        6
                      </span>
                      <span>
                        <strong>Processing:</strong> Your application will be processed within {selectedService.processingTime.toLowerCase()}
                      </span>
                    </li>
                  </ol>
                </section>

                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex gap-3">
                    <FileText className="h-5 w-5 text-amber-700" />
                    <div>
                      <h3 className="font-bold text-amber-900">
                        Application Guidance
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-amber-800">
                        {selectedService.guidance}
                      </p>
                      {stateSupport.length > 0 && (
                        <p className="mt-2 text-sm font-semibold text-amber-900">
                          Structured for: {stateSupport.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-700" />
                    <h3 className="font-bold text-slate-900">
                      Where Should I Go?
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    To apply for this service, visit the
                    <span className="font-semibold"> {selectedService.office}</span>
                    {" "}in your district. The service is handled by the
                    <span className="font-semibold"> {selectedService.department}</span>
                    {" "}department, and you can speak with a
                    <span className="font-semibold"> {selectedService.officerRole || "Service Officer"}</span>.
                  </p>
                  <Link
                    to="/government-offices"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-800"
                  >
                    Find Government Office
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </section>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="text-blue-700">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase text-slate-400">
          {label}
        </p>
        <p className="mt-1 font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200 p-5 ${className}`}>
      <h3 className="font-bold text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default Documents;
