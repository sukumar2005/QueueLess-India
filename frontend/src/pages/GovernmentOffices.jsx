import { Link } from "react-router-dom";
import { useState } from "react";
import LocationSelector from "../components/LocationSelector";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://queueless-india-a2ju.onrender.com/api";

const purposes = [
  "Income Certificate",
  "Community Certificate",
  "Birth Certificate",
  "Driving Licence",
  "Vehicle Registration",
  "Land Records",
];

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

  const loadOffices = async (selectedLocation) => {
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
        params.set("state", selectedLocation.state);
        params.set("district", selectedLocation.district);
        params.set("village", selectedLocation.village);
      }

      const response = await fetch(
        `${API_URL}/government-offices?${params.toString()}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load offices");
      }

      setOffices(data.offices || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadOfficers = async (office) => {
    setSelectedOffice(office);
    setSelectedOfficer(null);
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
        throw new Error(data.message || "Unable to load officers");
      }

      setOfficers(data.officers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async () => {
    if (!citizenName.trim() || !selectedOffice || !selectedOfficer) {
      setError("Enter citizen name and select an officer.");
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
          },
          body: JSON.stringify({
            citizenName: citizenName.trim(),
            officeId: selectedOffice._id,
            officerId: selectedOfficer._id,
            purpose,
            source: "online",
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to book appointment");
      }

      localStorage.setItem(
        "queueless_office_token",
        JSON.stringify(data.token)
      );
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="font-semibold text-blue-700"
        >
          Back to Home
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Government Offices
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Find nearby government offices
          </h1>
        </div>

        <div className="mt-8">
          <LocationSelector onLocationSelected={loadOffices} />
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {location && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-900">
              Government Office List
            </h2>

            {loading && (
              <p className="mt-4 text-slate-500">Loading...</p>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {offices.map((office) => (
                <button
                  key={office._id}
                  type="button"
                  onClick={() => loadOfficers(office)}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300"
                >
                  <h3 className="font-bold text-slate-900">
                    {office.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {office.type} • {office.village}, {office.district}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-green-700">
                    {office.availableOfficers} officers available
                  </p>
                  <p className="text-sm text-slate-500">
                    {office.waitingCount} people waiting
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

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
                  onClick={() => setPurpose(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    purpose === item
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => loadOfficers(selectedOffice)}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
            >
              Find Officers
            </button>
          </section>
        )}

        {officers.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-900">
              Officers
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {officers.map((officer) => (
                <button
                  key={officer._id}
                  type="button"
                  onClick={() => setSelectedOfficer(officer)}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300"
                >
                  <h3 className="font-bold text-slate-900">
                    {officer.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {officer.designation}
                  </p>
                  {officer.available ? (
                    <div className="mt-4 text-sm">
                      <p className="font-bold text-green-700">
                        Available
                      </p>
                      <p>People Waiting: {officer.peopleWaiting}</p>
                      <p>
                        Estimated Waiting Time:{" "}
                        {officer.estimatedWaitingTime} minutes
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 text-sm">
                      <p className="font-bold text-red-700">
                        Officer Not Available
                      </p>
                      <p>
                        Expected Arrival:{" "}
                        {officer.expectedArrival || "Not updated"}
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {selectedOfficer && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Book Appointment
            </h2>
            <input
              value={citizenName}
              onChange={(event) => setCitizenName(event.target.value)}
              placeholder="Citizen name"
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
            <button
              type="button"
              onClick={bookAppointment}
              disabled={!selectedOfficer.available || loading}
              className="mt-4 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              Book Appointment
            </button>
          </section>
        )}

        {token && (
          <section className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-6">
            <h2 className="text-xl font-bold text-green-900">
              Appointment Booked
            </h2>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <Info label="Office" value={token.governmentOffice?.name} />
              <Info label="Officer" value={token.officer?.name} />
              <Info label="Token" value={token.tokenNumber} />
              <Info label="Expected Time" value={token.expectedTime} />
              <Info label="Counter" value="Assigned when called" />
              <Info label="Purpose" value={purpose} />
            </div>
            <Link
              to={`/office-queue/${token._id}`}
              className="mt-5 inline-block rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white"
            >
              Track Live Queue
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xs font-semibold uppercase text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default GovernmentOffices;
