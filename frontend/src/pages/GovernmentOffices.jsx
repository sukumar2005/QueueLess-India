import { useState } from "react";
import { Link } from "react-router-dom";

import LocationSelector from "../components/LocationSelector";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://queueless-india-a2ju.onrender.com/api";

const purposes = [
  "Income Certificate",
  "Community Certificate",
  "Birth Certificate",
  "Death Certificate",
  "Driving Licence",
  "Vehicle Registration",
  "Land Records",
];

function getStoredSession() {
  try {
    const raw = localStorage.getItem("queueless_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function GovernmentOffices() {
  const [location, setLocation] = useState(null);
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [purpose, setPurpose] = useState("Income Certificate");
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [citizenName, setCitizenName] = useState("");
  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD GOVERNMENT OFFICES
  // ============================================================

  const loadOffices = async (selectedLocation) => {
    if (!selectedLocation) return;

    setLocation(selectedLocation);
    setSelectedOffice(null);
    setSelectedOfficer(null);
    setOfficers([]);
    setToken(null);
    setError("");

    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (selectedLocation.method === "manual") {
        if (selectedLocation.state) {
          params.set("state", selectedLocation.state);
        }

        if (selectedLocation.district) {
          params.set(
            "district",
            selectedLocation.district
          );
        }

        if (selectedLocation.village) {
          params.set(
            "village",
            selectedLocation.village
          );
        }
      }

      const response = await fetch(
        `${API_URL}/government-offices?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load government offices."
        );
      }

      setOffices(data.offices || []);
    } catch (err) {
      console.error(
        "Unable to load government offices:",
        err
      );

      setError(
        err?.message ||
          "Unable to load government offices."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD OFFICERS
  // ============================================================

  const loadOfficers = async (office) => {
    if (!office?._id) {
      setError("Invalid government office.");
      return;
    }

    setSelectedOffice(office);
    setSelectedOfficer(null);
    setOfficers([]);
    setToken(null);
    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/government-offices/${office._id}/officers?purpose=${encodeURIComponent(
          purpose
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load government officers."
        );
      }

      setOfficers(data.officers || []);

      if (
        !data.officers ||
        data.officers.length === 0
      ) {
        setError(
          "No government officers are currently available for this office."
        );
      }
    } catch (err) {
      console.error(
        "Unable to load government officers:",
        err
      );

      setOfficers([]);

      setError(
        err?.message ||
          "Unable to load government officers."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // BOOK APPOINTMENT
  // ============================================================

  const bookAppointment = async () => {
    if (
      !citizenName.trim() ||
      !selectedOffice ||
      !selectedOfficer
    ) {
      setError(
        "Enter citizen name and select an officer."
      );

      return;
    }

    // ------------------------------------------------------------
    // Get logged-in session
    // ------------------------------------------------------------

    const session = getStoredSession();

    if (!session?.token) {
      setError(
        "Please login before booking a government office appointment."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/government-offices/tokens`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            // IMPORTANT:
            // Send logged-in user's JWT
            Authorization: `Bearer ${session.token}`,
          },

          body: JSON.stringify({
            citizenName: citizenName.trim(),

            officeId:
              selectedOffice._id,

            officerId:
              selectedOfficer._id,

            purpose,

            source: "online",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to book appointment."
        );
      }

      // ----------------------------------------------------------
      // Save real database token
      // ----------------------------------------------------------

      if (!data.token?._id) {
        throw new Error(
          "Server did not return a valid queue token."
        );
      }

      localStorage.setItem(
        "queueless_office_token",
        JSON.stringify(data.token)
      );

      setToken(data.token);
      setCitizenName("");
    } catch (err) {
      console.error(
        "Unable to book government office appointment:",
        err
      );

      setError(
        err?.message ||
          "Unable to book appointment."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CHANGE PURPOSE
  // ============================================================

  const handlePurposeChange = (newPurpose) => {
    setPurpose(newPurpose);

    // Clear old officer selection because
    // available officers may depend on purpose.
    setSelectedOfficer(null);
    setOfficers([]);
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">

        {/* BACK */}
        <Link
          to="/"
          className="font-semibold text-blue-700"
        >
          ← Back to Home
        </Link>

        {/* HEADER */}
        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Government Offices
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Find nearby government offices
          </h1>

          <p className="mt-2 text-slate-500">
            Select an office, choose a service and book
            your queue token.
          </p>
        </div>

        {/* LOCATION */}
        <div className="mt-8">
          <LocationSelector
            onLocationSelected={loadOffices}
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm font-medium text-blue-700">
            Loading...
          </div>
        )}

        {/* ======================================================
            OFFICE LIST
        ====================================================== */}

        {location && (
          <section className="mt-8">

            <h2 className="text-xl font-bold text-slate-900">
              Government Office List
            </h2>

            {!loading &&
              offices.length === 0 && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
                  No government offices found
                  for this location.
                </div>
              )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">

              {offices.map((office) => (
                <button
                  key={office._id}
                  type="button"
                  onClick={() =>
                    loadOfficers(office)
                  }
                  className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md ${
                    selectedOffice?._id ===
                    office._id
                      ? "border-blue-600 ring-2 ring-blue-100"
                      : "border-slate-200"
                  }`}
                >

                  <h3 className="font-bold text-slate-900">
                    {office.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {office.type || "Government Office"}
                    {" • "}
                    {office.village || ""}
                    {office.district
                      ? `, ${office.district}`
                      : ""}
                  </p>

                  <p className="mt-3 text-sm font-semibold text-green-700">
                    {office.availableOfficers ??
                      0}{" "}
                    officers available
                  </p>

                  <p className="text-sm text-slate-500">
                    {office.waitingCount ?? 0}{" "}
                    people waiting
                  </p>

                </button>
              ))}

            </div>
          </section>
        )}

        {/* ======================================================
            PURPOSE
        ====================================================== */}

        {selectedOffice && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-900">
              Select Purpose / Service
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">

              {purposes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    handlePurposeChange(item)
                  }
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    purpose === item
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {item}
                </button>
              ))}

            </div>

            <button
              type="button"
              onClick={() =>
                loadOfficers(selectedOffice)
              }
              disabled={loading}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading
                ? "Loading Officers..."
                : "Find Officers"}
            </button>

          </section>
        )}

        {/* ======================================================
            OFFICERS
        ====================================================== */}

        {selectedOffice &&
          officers.length > 0 && (
            <section className="mt-8">

              <h2 className="text-xl font-bold text-slate-900">
                Officers
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">

                {officers.map((officer) => (
                  <button
                    key={officer._id}
                    type="button"
                    onClick={() =>
                      setSelectedOfficer(
                        officer
                      )
                    }
                    className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-blue-300 ${
                      selectedOfficer?._id ===
                      officer._id
                        ? "border-blue-600 ring-2 ring-blue-100"
                        : "border-slate-200"
                    }`}
                  >

                    <h3 className="font-bold text-slate-900">
                      {officer.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {officer.designation ||
                        "Government Officer"}
                    </p>

                    {officer.available ? (
                      <div className="mt-4 text-sm">

                        <p className="font-bold text-green-700">
                          Available
                        </p>

                        <p>
                          People Waiting:{" "}
                          {officer.peopleWaiting ??
                            0}
                        </p>

                        <p>
                          Estimated Waiting Time:{" "}
                          {officer.estimatedWaitingTime ??
                            0}{" "}
                          minutes
                        </p>

                      </div>
                    ) : (
                      <div className="mt-4 text-sm">

                        <p className="font-bold text-red-700">
                          Officer Not Available
                        </p>

                        <p>
                          Expected Arrival:{" "}
                          {officer.expectedArrival ||
                            "Not updated"}
                        </p>

                      </div>
                    )}

                  </button>
                ))}

              </div>

            </section>
          )}

        {/* ======================================================
            NO OFFICERS
        ====================================================== */}

        {selectedOffice &&
          !loading &&
          officers.length === 0 && (
            <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6">

              <h2 className="font-bold text-amber-900">
                No Officers Available
              </h2>

              <p className="mt-2 text-sm text-amber-800">
                There are currently no officers
                available for this office/service.
              </p>

            </section>
          )}

        {/* ======================================================
            BOOK APPOINTMENT
        ====================================================== */}

        {selectedOfficer && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-900">
              Book Appointment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Booking for{" "}
              <strong>
                {selectedOfficer.name}
              </strong>
            </p>

            <input
              value={citizenName}
              onChange={(event) =>
                setCitizenName(
                  event.target.value
                )
              }
              placeholder="Citizen name"
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />

            <button
              type="button"
              onClick={bookAppointment}
              disabled={
                !selectedOfficer.available ||
                loading ||
                !citizenName.trim()
              }
              className="mt-4 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Booking..."
                : "Book Appointment"}
            </button>

          </section>
        )}

        {/* ======================================================
            SUCCESS / TOKEN
        ====================================================== */}

        {token && (
          <section className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-6">

            <h2 className="text-xl font-bold text-green-900">
              Appointment Booked Successfully
            </h2>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">

              <Info
                label="Office"
                value={
                  token.governmentOffice?.name ||
                  selectedOffice?.name ||
                  "Government Office"
                }
              />

              <Info
                label="Officer"
                value={
                  token.officer?.name ||
                  selectedOfficer?.name ||
                  "Assigned Officer"
                }
              />

              <Info
                label="Token"
                value={
                  token.tokenNumber ||
                  "Not available"
                }
              />

              <Info
                label="Expected Time"
                value={
                  token.expectedTime ||
                  "Calculating..."
                }
              />

              <Info
                label="Counter"
                value="Assigned when called"
              />

              <Info
                label="Purpose"
                value={
                  token.purpose ||
                  purpose
                }
              />

            </div>

            {/* IMPORTANT:
                Use the REAL MongoDB _id.
                Do NOT use demo-xxxx.
            */}

            {token._id && (
              <Link
                to={`/office-queue/${token._id}`}
                className="mt-5 inline-block rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Track Live Queue
              </Link>
            )}

          </section>
        )}

      </div>
    </main>
  );
}

// ============================================================
// INFO COMPONENT
// ============================================================

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xs font-semibold uppercase text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-bold text-slate-900">
        {value || "—"}
      </p>
    </div>
  );
}

export default GovernmentOffices;