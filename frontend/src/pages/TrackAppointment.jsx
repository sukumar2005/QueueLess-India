import { useState } from "react";

const getSavedToken = () => {
  try {
    const savedToken = localStorage.getItem(
      "queueless_hospital_token"
    );

    if (!savedToken) {
      return {
        token: null,
        error: "No appointment found.",
      };
    }

    const parsedToken = JSON.parse(savedToken);

    return {
      token: parsedToken,
      error: "",
    };
  } catch (error) {
    console.error("Load appointment error:", error);

    return {
      token: null,
      error: "Unable to load appointment.",
    };
  }
};

const TrackAppointment = () => {
  const initialData = getSavedToken();

  const [token, setToken] = useState(
    initialData.token
  );

  const [error, setError] = useState(
    initialData.error
  );

  // ======================================================
  // REFRESH APPOINTMENT
  // ======================================================

  const refreshAppointment = () => {
    try {
      const savedToken = localStorage.getItem(
        "queueless_hospital_token"
      );

      if (!savedToken) {
        setToken(null);
        setError("No appointment found.");
        return;
      }

      const parsedToken = JSON.parse(savedToken);

      setToken(parsedToken);
      setError("");
    } catch (err) {
      console.error(
        "Refresh appointment error:",
        err
      );

      setToken(null);
      setError(
        "Unable to load appointment."
      );
    }
  };

  // ======================================================
  // NO APPOINTMENT
  // ======================================================

  if (error || !token) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-2xl">

          <div className="rounded-2xl bg-white p-8 text-center shadow">

            <h1 className="text-3xl font-bold text-slate-900">
              No Appointment Found
            </h1>

            <p className="mt-4 text-slate-600">
              {error ||
                "Please book a hospital appointment first."}
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/hospitals";
              }}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Book Appointment
            </button>

          </div>

        </div>
      </main>
    );
  }

  // ======================================================
  // TRACK APPOINTMENT
  // ======================================================

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">

      <div className="mx-auto max-w-4xl">

        {/* PAGE HEADER */}

        <div className="mb-8">

          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="mb-6 font-semibold text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Track Appointment
          </h1>

          <p className="mt-2 text-slate-600">
            Track your hospital appointment and
            current queue status.
          </p>

        </div>

        {/* TOKEN CARD */}

        <div className="rounded-2xl bg-white p-8 shadow">

          {/* TOKEN NUMBER */}

          <div className="text-center">

            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Your Token Number
            </p>

            <h2 className="mt-3 text-5xl font-bold text-blue-600">
              {token.tokenNumber}
            </h2>

            <div className="mt-4 inline-flex rounded-full bg-yellow-100 px-5 py-2 text-sm font-semibold capitalize text-yellow-700">
              {token.status || "waiting"}
            </div>

          </div>

          {/* APPOINTMENT DETAILS */}

          <div className="mt-10 grid gap-5 md:grid-cols-2">

            {/* PATIENT */}

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Patient
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {token.patientName ||
                  token.citizenName ||
                  "Patient"}
              </p>

            </div>

            {/* PROBLEM */}

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Problem
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {token.problem || "General Checkup"}
              </p>

            </div>

            {/* HOSPITAL */}

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Hospital
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {token.hospital?.name ||
                  "Hospital"}
              </p>

            </div>

            {/* DOCTOR */}

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Doctor
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {token.doctor?.name ||
                  "Doctor"}
              </p>

            </div>

            {/* SPECIALIZATION */}

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Specialization
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {token.doctor?.specialization ||
                  "General Medicine"}
              </p>

            </div>

            {/* ROOM */}

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Room
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {token.doctor?.room || "Not assigned"}
              </p>

            </div>

          </div>

          {/* QUEUE INFORMATION */}

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-6">

            <h2 className="text-xl font-bold text-blue-900">
              Live Queue Information
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-3">

              {/* PEOPLE WAITING */}

              <div>

                <p className="text-sm text-blue-600">
                  People Waiting
                </p>

                <p className="mt-1 text-3xl font-bold text-blue-900">
                  {token.peopleWaiting ?? 0}
                </p>

              </div>

              {/* WAITING TIME */}

              <div>

                <p className="text-sm text-blue-600">
                  Estimated Waiting
                </p>

                <p className="mt-1 text-3xl font-bold text-blue-900">
                  {token.estimatedWaitingTime ?? 0}
                  <span className="ml-1 text-base font-medium">
                    min
                  </span>
                </p>

              </div>

              {/* EXPECTED TIME */}

              <div>

                <p className="text-sm text-blue-600">
                  Expected Time
                </p>

                <p className="mt-1 text-xl font-bold text-blue-900">
                  {token.expectedTime ||
                    "Calculating..."}
                </p>

              </div>

            </div>

          </div>

          {/* STATUS */}

          <div className="mt-6 rounded-xl border border-slate-200 p-6">

            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Appointment Status
            </p>

            <p className="mt-2 text-2xl font-bold capitalize text-slate-900">
              {token.status || "waiting"}
            </p>

            {token.status === "waiting" && (
              <p className="mt-2 text-slate-600">
                Please wait for your token to
                be called.
              </p>
            )}

            {token.status === "serving" && (
              <p className="mt-2 font-semibold text-green-600">
                Your token is being served. Please
                proceed to the doctor.
              </p>
            )}

            {token.status === "completed" && (
              <p className="mt-2 font-semibold text-green-600">
                Your appointment has been completed.
              </p>
            )}

            {token.status === "skipped" && (
              <p className="mt-2 font-semibold text-red-600">
                Your token was skipped. Please
                contact the hospital.
              </p>
            )}

          </div>

          {/* ACTION BUTTONS */}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">

            <button
              type="button"
              onClick={refreshAppointment}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Refresh Status
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/hospitals";
              }}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Book Another Appointment
            </button>

          </div>

        </div>

      </div>

    </main>
  );
};

export default TrackAppointment;