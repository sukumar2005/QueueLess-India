import { Link } from "react-router-dom";
import { useState } from "react";
import LocationSelector from "../components/LocationSelector";

// ======================================================
// API URL
// ======================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ======================================================
// DISEASE / PROBLEM LIST
// ======================================================

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

// ======================================================
// COMPONENT
// ======================================================

function Hospitals() {
  const [location, setLocation] = useState(null);

  const [hospitals, setHospitals] = useState([]);

  const [selectedHospital, setSelectedHospital] =
    useState(null);

  const [problem, setProblem] =
    useState("Fever");

  const [typedProblem, setTypedProblem] =
    useState("");

  const [doctors, setDoctors] =
    useState([]);

  const [selectedDoctor, setSelectedDoctor] =
    useState(null);

  const [patientName, setPatientName] =
    useState("");

  const [token, setToken] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ======================================================
  // SELECTED PROBLEM
  // ======================================================

  const selectedProblem =
    problem === "Other"
      ? typedProblem.trim() || "Other"
      : problem;

  // ======================================================
  // LOAD HOSPITALS
  // ======================================================

  const loadHospitals = async (selectedLocation) => {
    setLocation(selectedLocation);

    setSelectedHospital(null);
    setSelectedDoctor(null);
    setDoctors([]);
    setToken(null);
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (
        selectedLocation &&
        selectedLocation.method === "manual"
      ) {
        if (selectedLocation.state) {
          params.set(
            "state",
            selectedLocation.state
          );
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

      const query =
        params.toString();

      const url =
        `${API_URL}/hospitals` +
        (query ? `?${query}` : "");

      console.log(
        "Loading hospitals:",
        url
      );

      const response =
        await fetch(url);

      const data =
        await response.json();

      console.log(
        "Hospital response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to load hospitals"
        );
      }

      setHospitals(
        Array.isArray(data.hospitals)
          ? data.hospitals
          : []
      );

      if (
        !data.hospitals ||
        data.hospitals.length === 0
      ) {
        setError(
          "No hospitals found for the selected location."
        );
      }

    } catch (err) {
      console.error(
        "Load hospitals error:",
        err
      );

      setError(
        err.message ||
        "Unable to connect to backend."
      );

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD DOCTORS
  // ======================================================

  const loadDoctors = async (hospital) => {
    if (!hospital || !hospital._id) {
      setError(
        "Hospital information is missing."
      );
      return;
    }

    setSelectedHospital(hospital);
    setSelectedDoctor(null);
    setDoctors([]);
    setToken(null);
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const url =
        `${API_URL}/hospitals/${hospital._id}/doctors?problem=${encodeURIComponent(
          selectedProblem
        )}`;

      console.log(
        "Loading doctors:",
        url
      );

      const response =
        await fetch(url);

      const data =
        await response.json();

      console.log(
        "Doctor response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to load doctors"
        );
      }

      const doctorList =
        Array.isArray(data.doctors)
          ? data.doctors
          : [];

      setDoctors(doctorList);

      if (doctorList.length === 0) {
        setError(
          `No doctors found for "${selectedProblem}" at ${hospital.name}.`
        );
      }

    } catch (err) {
      console.error(
        "Load doctors error:",
        err
      );

      setDoctors([]);

      setError(
        err.message ||
        "Unable to load doctors. Check whether backend is running."
      );

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // BOOK APPOINTMENT
  // ======================================================

  const bookAppointment = async () => {
    console.log(
      "========== BOOK APPOINTMENT =========="
    );

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!patientName.trim()) {
      setError(
        "Please enter patient name."
      );
      return;
    }

    if (!selectedHospital) {
      setError(
        "Please select a hospital."
      );
      return;
    }

    if (!selectedDoctor) {
      setError(
        "Please select a doctor."
      );
      return;
    }

    if (!selectedDoctor.available) {
      setError(
        `${selectedDoctor.name} is currently unavailable.`
      );
      return;
    }

    if (!selectedProblem) {
      setError(
        "Please select a problem."
      );
      return;
    }

    // ------------------------------------------
    // START BOOKING
    // ------------------------------------------

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      console.log(
        "Patient:",
        patientName
      );

      console.log(
        "Hospital ID:",
        selectedHospital._id
      );

      console.log(
        "Doctor ID:",
        selectedDoctor._id
      );

      console.log(
        "Problem:",
        selectedProblem
      );

      // ------------------------------------------
      // API REQUEST
      // ------------------------------------------

      const response =
        await fetch(
          `${API_URL}/hospitals/tokens`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              patientName:
                patientName.trim(),

              hospitalId:
                selectedHospital._id,

              doctorId:
                selectedDoctor._id,

              problem:
                selectedProblem,

              source: "online",
            }),
          }
        );

      console.log(
        "Booking HTTP status:",
        response.status
      );

      // ------------------------------------------
      // READ RESPONSE
      // ------------------------------------------

      const data =
        await response.json();

      console.log(
        "Booking API response:",
        data
      );

      // ------------------------------------------
      // API ERROR
      // ------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to book appointment"
        );
      }

      // ------------------------------------------
      // TOKEN CHECK
      // ------------------------------------------

      if (!data.token) {
        throw new Error(
          "Booking response did not contain token information."
        );
      }

      // ------------------------------------------
      // SAVE TOKEN
      // ------------------------------------------

      localStorage.setItem(
        "queueless_hospital_token",
        JSON.stringify(data.token)
      );

      // ------------------------------------------
      // UPDATE SCREEN
      // ------------------------------------------

      setToken(data.token);

      setSuccess(
        "Appointment booked successfully!"
      );

      setError("");

      console.log(
        "TOKEN SAVED:",
        data.token
      );

      // ------------------------------------------
      // SCROLL TO CONFIRMATION
      // ------------------------------------------

      setTimeout(() => {
        const confirmation =
          document.getElementById(
            "appointment-confirmation"
          );

        if (confirmation) {
          confirmation.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);

    } catch (err) {
      console.error(
        "Book appointment error:",
        err
      );

      setSuccess("");

      setError(
        err.message ||
        "Unable to book appointment"
      );

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // RESET / BOOK ANOTHER
  // ======================================================

  const bookAnotherAppointment = () => {
    setToken(null);
    setSuccess("");
    setError("");
    setPatientName("");
    setSelectedDoctor(null);
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">

      <div className="mx-auto max-w-5xl">

        {/* ==================================================
            BACK
        ================================================== */}

        <Link
          to="/"
          className="font-semibold text-blue-700"
        >
          Back to Home
        </Link>

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="mt-6">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Hospitals
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Find nearby hospitals
          </h1>

          <p className="mt-2 text-slate-500">
            Select your location, choose a doctor,
            and book your appointment.
          </p>

        </div>

        {/* ==================================================
            LOCATION
        ================================================== */}

        <div className="mt-8">

          <LocationSelector
            onLocationSelected={
              loadHospitals
            }
          />

        </div>

        {/* ==================================================
            SUCCESS MESSAGE
        ================================================== */}

        {success && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 font-semibold text-green-700">
            ✓ {success}
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ==================================================
            HOSPITALS
        ================================================== */}

        {location && (
          <section className="mt-8">

            <h2 className="text-xl font-bold text-slate-900">
              Hospitals
            </h2>

            {loading && (
              <p className="mt-4 text-slate-500">
                Loading...
              </p>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">

              {hospitals.map(
                (hospital) => (

                  <button
                    key={hospital._id}
                    type="button"
                    onClick={() =>
                      loadDoctors(
                        hospital
                      )
                    }
                    className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md ${
                      selectedHospital?._id ===
                      hospital._id
                        ? "border-blue-600 ring-2 ring-blue-100"
                        : "border-slate-200"
                    }`}
                  >

                    <h3 className="font-bold text-slate-900">
                      {hospital.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {hospital.village},{" "}
                      {hospital.district}
                    </p>

                    <p className="mt-3 text-sm font-semibold text-green-700">
                      {hospital.availableDoctors ?? 0}{" "}
                      doctors available
                    </p>

                    <p className="text-sm text-slate-500">
                      {hospital.waitingCount ?? 0}{" "}
                      people waiting
                    </p>

                  </button>

                )
              )}

            </div>

          </section>
        )}

        {/* ==================================================
            PROBLEM SELECTION
        ================================================== */}

        {selectedHospital && !token && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-900">
              Select disease or problem
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">

              {diseases.map(
                (item) => (

                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setProblem(item);
                      setDoctors([]);
                      setSelectedDoctor(null);
                      setError("");
                      setSuccess("");
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      problem === item
                        ? "bg-blue-700 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {item}
                  </button>

                )
              )}

            </div>

            {/* OTHER */}

            {problem === "Other" && (
              <input
                value={typedProblem}
                onChange={(event) =>
                  setTypedProblem(
                    event.target.value
                  )
                }
                placeholder="Type your problem"
                className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            )}

            {/* FIND DOCTORS */}

            <button
              type="button"
              onClick={() =>
                loadDoctors(
                  selectedHospital
                )
              }
              disabled={loading}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Finding Doctors..."
                : "Find Doctors"}
            </button>

          </section>
        )}

        {/* ==================================================
            NO DOCTORS
        ================================================== */}

        {selectedHospital &&
          !loading &&
          doctors.length === 0 &&
          !error &&
          !token && (
            <section className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-6">

              <h2 className="font-bold text-yellow-900">
                No doctors found
              </h2>

              <p className="mt-2 text-sm text-yellow-800">
                No doctor is currently registered
                for {selectedProblem} at{" "}
                {selectedHospital.name}.
              </p>

            </section>
          )}

        {/* ==================================================
            DOCTORS
        ================================================== */}

        {doctors.length > 0 && !token && (
          <section className="mt-8">

            <h2 className="text-xl font-bold text-slate-900">
              Relevant Doctors
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Doctors available for:{" "}
              <strong>
                {selectedProblem}
              </strong>
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">

              {doctors.map(
                (doctor) => (

                  <button
                    key={doctor._id}
                    type="button"
                    disabled={!doctor.available}
                    onClick={() =>
                      setSelectedDoctor(
                        doctor
                      )
                    }
                    className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition ${
                      selectedDoctor?._id ===
                      doctor._id
                        ? "border-blue-600 ring-2 ring-blue-100"
                        : "border-slate-200"
                    } ${
                      doctor.available
                        ? "hover:border-blue-300"
                        : "cursor-not-allowed opacity-70"
                    }`}
                  >

                    <h3 className="font-bold text-slate-900">
                      {doctor.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {doctor.specialization}
                      {" • "}
                      Room {doctor.room}
                    </p>

                    {/* AVAILABLE */}

                    {doctor.available ? (

                      <div className="mt-4 text-sm">

                        <p className="font-bold text-green-700">
                          ✓ Doctor Available
                        </p>

                        <p className="mt-1">
                          People Waiting:{" "}
                          {doctor.peopleWaiting ??
                            0}
                        </p>

                        <p>
                          Estimated Waiting Time:{" "}
                          {doctor.estimatedWaitingTime ??
                            0}{" "}
                          minutes
                        </p>

                      </div>

                    ) : (

                      <div className="mt-4 text-sm">

                        <p className="font-bold text-red-700">
                          Doctor Not Available
                        </p>

                        <p className="mt-1">
                          Expected Arrival:{" "}
                          {doctor.expectedArrival ||
                            "Not updated"}
                        </p>

                      </div>

                    )}

                  </button>

                )
              )}

            </div>

          </section>
        )}

        {/* ==================================================
            BOOK APPOINTMENT
        ================================================== */}

        {selectedDoctor && !token && (

          <section className="mt-8 rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-900">
              Book Appointment
            </h2>

            <div className="mt-4 rounded-xl bg-blue-50 p-4">

              <p className="text-sm text-slate-500">
                Selected Hospital
              </p>

              <p className="font-bold text-slate-900">
                {selectedHospital?.name}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Selected Doctor
              </p>

              <p className="font-bold text-slate-900">
                {selectedDoctor.name}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Problem
              </p>

              <p className="font-bold text-slate-900">
                {selectedProblem}
              </p>

            </div>

            {/* PATIENT NAME */}

            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Patient Name
            </label>

            <input
              value={patientName}
              onChange={(event) =>
                setPatientName(
                  event.target.value
                )
              }
              placeholder="Enter patient name"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {/* BOOK BUTTON */}

            <button
              type="button"
              onClick={bookAppointment}
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Booking Appointment..."
                : "Book Appointment"}
            </button>

          </section>

        )}

        {/* ==================================================
            APPOINTMENT CONFIRMATION
        ================================================== */}

        {token && (

          <section
            id="appointment-confirmation"
            className="mt-8 rounded-3xl border-2 border-green-300 bg-green-50 p-6 shadow-lg"
          >

            {/* SUCCESS */}

            <div className="text-center">

              <div className="text-5xl">
                ✓
              </div>

              <h2 className="mt-3 text-2xl font-bold text-green-900">
                Appointment Booked Successfully!
              </h2>

              <p className="mt-2 text-green-700">
                Your hospital appointment has been confirmed.
              </p>

            </div>

            {/* TOKEN NUMBER */}

            <div className="mt-6 rounded-2xl bg-white p-6 text-center shadow-sm">

              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Your Token Number
              </p>

              <p className="mt-2 text-5xl font-black text-blue-700">
                {token.tokenNumber}
              </p>

            </div>

            {/* DETAILS */}

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <Info
                label="Patient"
                value={
                  token.patientName ||
                  patientName
                }
              />

              <Info
                label="Hospital"
                value={
                  token.hospital?.name ||
                  selectedHospital?.name
                }
              />

              <Info
                label="Doctor"
                value={
                  token.doctor?.name ||
                  selectedDoctor?.name
                }
              />

              <Info
                label="Specialization"
                value={
                  token.doctor?.specialization ||
                  selectedDoctor?.specialization
                }
              />

              <Info
                label="Problem"
                value={
                  token.problem ||
                  selectedProblem
                }
              />

              <Info
                label="Room"
                value={
                  token.doctor?.room ||
                  selectedDoctor?.room
                }
              />

              <Info
                label="People Waiting"
                value={
                  token.peopleWaiting ??
                  0
                }
              />

              <Info
                label="Estimated Waiting Time"
                value={
                  `${token.estimatedWaitingTime ?? 0} minutes`
                }
              />

              <Info
                label="Expected Time"
                value={
                  token.expectedTime
                }
              />

              <Info
                label="Status"
                value={
                  token.status || "waiting"
                }
              />

            </div>

            {/* ACTIONS */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <Link
                to={`/hospital-queue/${token._id}`}
                className="flex-1 rounded-xl bg-blue-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-800"
              >
                Track Live Queue
              </Link>

              <button
                type="button"
                onClick={
                  bookAnotherAppointment
                }
                className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Book Another Appointment
              </button>

            </div>

          </section>

        )}

      </div>

    </main>
  );
}

// ======================================================
// INFO COMPONENT
// ======================================================

function Info({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-bold text-slate-900">
        {value || "Not available"}
      </p>

    </div>
  );
}

// ======================================================
// EXPORT
// ======================================================

export default Hospitals;