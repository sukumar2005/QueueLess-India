import { Link } from "react-router-dom";
import { useState } from "react";
import LocationSelector from "../components/LocationSelector";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://queueless-india-a2ju.onrender.com/api";

const diseases = [
  "Fever",
  "Cold",
  "Cough",
  "Headache",
  "Stomach Pain",
  "Skin Problem",
  "Diabetes",
  "Blood Pressure",
  "Chest Pain",
  "Injury",
  "General Checkup",
  "Other",
];

function Hospitals() {
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [problem, setProblem] = useState("Fever");
  const [typedProblem, setTypedProblem] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedProblem =
    problem === "Other" ? typedProblem || "Other" : problem;

  const loadHospitals = async (selectedLocation) => {
    setLocation(selectedLocation);
    setSelectedHospital(null);
    setSelectedDoctor(null);
    setDoctors([]);
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
        `${API_URL}/hospitals?${params.toString()}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load hospitals");
      }

      setHospitals(data.hospitals || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async (hospital) => {
    setSelectedHospital(hospital);
    setSelectedDoctor(null);
    setDoctors([]);
    setToken(null);
    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/hospitals/${hospital._id}/doctors?problem=${encodeURIComponent(
          selectedProblem
        )}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load doctors");
      }

      setDoctors(data.doctors || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async () => {
    if (!patientName.trim() || !selectedHospital || !selectedDoctor) {
      setError("Enter patient name and select a doctor.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/hospitals/tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientName: patientName.trim(),
          hospitalId: selectedHospital._id,
          doctorId: selectedDoctor._id,
          problem: selectedProblem,
          source: "online",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to book appointment");
      }

      localStorage.setItem(
        "queueless_hospital_token",
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
            Hospitals
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Find nearby hospitals
          </h1>
        </div>

        <div className="mt-8">
          <LocationSelector onLocationSelected={loadHospitals} />
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {location && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-900">
              Hospitals
            </h2>

            {loading && (
              <p className="mt-4 text-slate-500">Loading...</p>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {hospitals.map((hospital) => (
                <button
                  key={hospital._id}
                  type="button"
                  onClick={() => loadDoctors(hospital)}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300"
                >
                  <h3 className="font-bold text-slate-900">
                    {hospital.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {hospital.village}, {hospital.district}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-green-700">
                    {hospital.availableDoctors} doctors available
                  </p>
                  <p className="text-sm text-slate-500">
                    {hospital.waitingCount} people waiting
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {selectedHospital && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Select disease or problem
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {diseases.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setProblem(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    problem === item
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {problem === "Other" && (
              <input
                value={typedProblem}
                onChange={(event) =>
                  setTypedProblem(event.target.value)
                }
                placeholder="Type your problem"
                className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            )}

            <button
              type="button"
              onClick={() => loadDoctors(selectedHospital)}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
            >
              Find Doctors
            </button>
          </section>
        )}

        {doctors.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-900">
              Relevant Doctors
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {doctors.map((doctor) => (
                <button
                  key={doctor._id}
                  type="button"
                  onClick={() => setSelectedDoctor(doctor)}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300"
                >
                  <h3 className="font-bold text-slate-900">
                    {doctor.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {doctor.specialization} • Room {doctor.room}
                  </p>

                  {doctor.available ? (
                    <div className="mt-4 text-sm">
                      <p className="font-bold text-green-700">
                        Doctor Available
                      </p>
                      <p>People Waiting: {doctor.peopleWaiting}</p>
                      <p>
                        Estimated Waiting Time:{" "}
                        {doctor.estimatedWaitingTime} minutes
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 text-sm">
                      <p className="font-bold text-red-700">
                        Doctor Not Available
                      </p>
                      <p>
                        Expected Arrival:{" "}
                        {doctor.expectedArrival || "Not updated"}
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {selectedDoctor && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Book Appointment
            </h2>

            <input
              value={patientName}
              onChange={(event) => setPatientName(event.target.value)}
              placeholder="Patient name"
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />

            <button
              type="button"
              onClick={bookAppointment}
              disabled={!selectedDoctor.available || loading}
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
              <Info label="Hospital" value={token.hospital?.name} />
              <Info label="Doctor" value={token.doctor?.name} />
              <Info label="Token" value={token.tokenNumber} />
              <Info label="Expected Time" value={token.expectedTime} />
              <Info label="Room" value={token.doctor?.room} />
              <Info label="People Ahead" value="Calculated live" />
            </div>
            <Link
              to={`/hospital-queue/${token._id}`}
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

export default Hospitals;
