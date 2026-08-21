import {
  CheckCircle2,
  Play,
  RefreshCw,
  SkipForward,
  UserPlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://queueless-india-a2ju.onrender.com/api"
).replace(/\/$/, "");

/*
 * HospitalDashboard.jsx
 *
 * Fixes included:
 * 1. Removed unnecessary useCallback/manual memoization.
 * 2. Removed unused icon imports.
 * 3. Effects do not depend on functions recreated on every render.
 * 4. Queue polling does NOT turn on the loading spinner every 5 seconds.
 *    This removes the visible flicker.
 * 5. Old queue responses cannot overwrite newer queue responses.
 * 6. Attendance actions use the backend's canonical action names:
 *      check-in
 *      check-out
 *      start-break
 *      end-break
 *      save-hours
 * 7. API responses are safely handled when the server returns HTML.
 * 8. Existing hospital, doctor, counter, attendance, offline token,
 *    current serving, queue control and unified queue features are kept.
 */

const getSessionToken = () => {
  try {
    const session = JSON.parse(
      localStorage.getItem("queueless_session") || "null"
    );

    return session?.token || "";
  } catch {
    return "";
  }
};

const getHeaders = (token = getSessionToken()) => {
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const readResponse = async (response) => {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Request failed (${response.status})`
      );
    }

    return data;
  }

  const text = await response.text();

  if (!response.ok) {
    const cleanText = text
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    throw new Error(
      cleanText
        ? `Server returned ${response.status}: ${cleanText.slice(0, 180)}`
        : `Server returned ${response.status}`
    );
  }

  throw new Error(
    "Server returned an unexpected response. Please check the API route."
  );
};

const fetchHospitals = async () => {
  const response = await fetch(
    `${API_URL}/hospitals`,
    {
      headers: getHeaders(),
    }
  );

  return readResponse(response);
};

const fetchDoctors = async (hospitalId) => {
  if (!hospitalId) {
    return { doctors: [] };
  }

  const response = await fetch(
    `${API_URL}/hospitals/${encodeURIComponent(
      hospitalId
    )}/doctors`,
    {
      headers: getHeaders(),
    }
  );

  return readResponse(response);
};

const fetchQueue = async (hospitalId, doctorId) => {
  if (!hospitalId || !doctorId) {
    return {
      queue: [],
      currentToken: null,
    };
  }

  const url =
    `${API_URL}/hospitals/queue/status` +
    `?hospitalId=${encodeURIComponent(hospitalId)}` +
    `&doctorId=${encodeURIComponent(doctorId)}`;

  const response = await fetch(url, {
    headers: getHeaders(),
  });

  return readResponse(response);
};

function HospitalDashboard() {
  // ======================================================
  // STATE
  // ======================================================

  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [hospitalId, setHospitalId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [counter, setCounter] = useState(1);

  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");

  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);

  const [breakReason, setBreakReason] = useState("");
  const [workingStart, setWorkingStart] = useState("09:00");
  const [workingEnd, setWorkingEnd] = useState("18:00");

  const [error, setError] = useState("");
  const [attendanceError, setAttendanceError] =
    useState("");

  const [loadingHospitals, setLoadingHospitals] =
    useState(false);
  const [loadingDoctors, setLoadingDoctors] =
    useState(false);
  const [loadingQueue, setLoadingQueue] =
    useState(false);
  const [actionLoading, setActionLoading] =
    useState(false);

  /*
   * Each queue request gets a number.
   * If an older request returns after a newer request,
   * its result is ignored.
   */
  const queueRequestRef = useRef(0);

  // ======================================================
  // DERIVED DATA
  // ======================================================

  const selectedHospital = hospitals.find(
    (hospital) => hospital._id === hospitalId
  );

  const selectedDoctor = doctors.find(
    (doctor) => doctor._id === doctorId
  );

  const waitingQueue = queue.filter(
    (token) => token.status === "waiting"
  );

  const visibleQueue = [
    ...(currentToken ? [currentToken] : []),
    ...waitingQueue.filter(
      (token) => token._id !== currentToken?._id
    ),
  ];

  // ======================================================
  // LOAD QUEUE FROM A BUTTON/ACTION
  // ======================================================

  const loadQueue = async (showLoading = true) => {
    if (!hospitalId || !doctorId) {
      return;
    }

    const requestId =
      queueRequestRef.current + 1;

    queueRequestRef.current = requestId;

    if (showLoading) {
      setLoadingQueue(true);
    }

    try {
      const data = await fetchQueue(
        hospitalId,
        doctorId
      );

      /*
       * Ignore stale responses.
       */
      if (
        requestId !== queueRequestRef.current
      ) {
        return;
      }

      const latestQueue = Array.isArray(data.queue)
        ? data.queue
        : [];

      setQueue(latestQueue);
      setCurrentToken(
        data.currentToken || null
      );
      setError("");
    } catch (err) {
      /*
       * Do not replace a working queue with an error
       * during background refresh.
       */
      if (showLoading) {
        setError(
          err.message ||
            "Unable to load queue."
        );
      } else {
        console.error(
          "Background queue refresh error:",
          err
        );
      }
    } finally {
      if (
        showLoading &&
        requestId === queueRequestRef.current
      ) {
        setLoadingQueue(false);
      }
    }
  };

  // ======================================================
  // INITIAL LOAD - HOSPITALS
  // ======================================================

  useEffect(() => {
    let active = true;

    const timer = setTimeout(() => {
      const run = async () => {
        try {
          if (active) {
            setLoadingHospitals(true);
            setError("");
          }

          const data = await fetchHospitals();

          if (!active) {
            return;
          }

          const list = Array.isArray(
            data.hospitals
          )
            ? data.hospitals
            : [];

          setHospitals(list);

          setHospitalId((previous) => {
            if (
              previous &&
              list.some(
                (hospital) =>
                  hospital._id === previous
              )
            ) {
              return previous;
            }

            return list[0]?._id || "";
          });
        } catch (err) {
          if (active) {
            console.error(
              "Load hospitals error:",
              err
            );

            setError(
              err.message ||
                "Unable to load hospitals."
            );
          }
        } finally {
          if (active) {
            setLoadingHospitals(false);
          }
        }
      };

      void run();
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  // ======================================================
  // LOAD DOCTORS WHEN HOSPITAL CHANGES
  // ======================================================

  useEffect(() => {
    if (!hospitalId) {
      return undefined;
    }

    let active = true;

    /*
     * Small delay prevents a rapid hospital-select change
     * from causing multiple immediate requests.
     */
    const timer = setTimeout(() => {
      const run = async () => {
        try {
          setLoadingDoctors(true);
          setError("");

          const data = await fetchDoctors(
            hospitalId
          );

          if (!active) {
            return;
          }

          const list = Array.isArray(
            data.doctors
          )
            ? data.doctors
            : [];

          setDoctors(list);

          setDoctorId((previous) => {
            if (
              previous &&
              list.some(
                (doctor) =>
                  doctor._id === previous
              )
            ) {
              return previous;
            }

            return list[0]?._id || "";
          });

          /*
           * Do not clear the visible queue here.
           * The queue is replaced only after the new
           * doctor's queue response arrives.
           */
        } catch (err) {
          if (active) {
            console.error(
              "Load doctors error:",
              err
            );

            setDoctors([]);
            setDoctorId("");
            setQueue([]);
            setCurrentToken(null);

            setError(
              err.message ||
                "Unable to load doctors."
            );
          }
        } finally {
          if (active) {
            setLoadingDoctors(false);
          }
        }
      };

      void run();
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [hospitalId]);

  // ======================================================
  // REAL-TIME QUEUE POLLING
  // ======================================================

  useEffect(() => {
    if (!hospitalId || !doctorId) {
      return undefined;
    }

    let active = true;
    let requestNumber = 0;

    const refreshSilently = async () => {
      const currentRequest =
        requestNumber + 1;

      requestNumber = currentRequest;

      try {
        const data = await fetchQueue(
          hospitalId,
          doctorId
        );

        /*
         * Ignore this request if the effect was
         * recreated or the request is old.
         */
        if (
          !active ||
          currentRequest !== requestNumber
        ) {
          return;
        }

        const latestQueue = Array.isArray(
          data.queue
        )
          ? data.queue
          : [];

        setQueue(latestQueue);
        setCurrentToken(
          data.currentToken || null
        );
      } catch (err) {
        if (active) {
          /*
           * Background refresh should not flash a red
           * error every five seconds.
           */
          console.error(
            "Background queue refresh error:",
            err
          );
        }
      }
    };

    const firstLoadTimer = setTimeout(() => {
      void refreshSilently();
    }, 0);

    const interval = setInterval(() => {
      void refreshSilently();
    }, 5000);

    return () => {
      active = false;
      clearTimeout(firstLoadTimer);
      clearInterval(interval);
    };
  }, [hospitalId, doctorId]);

  // ======================================================
  // CREATE OFFLINE TOKEN
  // ======================================================

  const createOfflineToken = async () => {
    if (!patientName.trim()) {
      setError("Patient name is required.");
      return;
    }

    if (!hospitalId || !doctorId) {
      setError(
        "Select hospital and doctor first."
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/hospitals/tokens`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getHeaders(),
          },
          body: JSON.stringify({
            patientName:
              patientName.trim(),
            phone: phone.trim(),
            hospitalId,
            doctorId,
            problem:
              "General Consultation",
            source: "offline",
          }),
        }
      );

      await readResponse(response);

      setPatientName("");
      setPhone("");

      /*
       * Immediate refresh after creation.
       * The five-second polling continues in the background.
       */
      await loadQueue(true);
    } catch (err) {
      console.error(
        "Create offline token error:",
        err
      );

      setError(
        err.message ||
          "Unable to create offline token."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ======================================================
  // REAL QUEUE CONTROL
  // ======================================================

  const queueAction = async (action) => {
    if (!hospitalId || !doctorId) {
      setError(
        "Select hospital and doctor first."
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/hospitals/queue/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getHeaders(),
          },
          body: JSON.stringify({
            hospitalId,
            doctorId,
            counter,
          }),
        }
      );

      await readResponse(response);

      /*
       * Refresh immediately after Call Next,
       * Complete or Skip.
       */
      await loadQueue(true);
    } catch (err) {
      console.error(
        `Queue ${action} error:`,
        err
      );

      setError(
        err.message ||
          "Queue action failed."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ======================================================
  // DOCTOR ATTENDANCE
  // ======================================================

  const updateDoctorAttendance = async (
    action
  ) => {
    if (!hospitalId || !doctorId) {
      setAttendanceError(
        "Select a hospital and doctor first."
      );
      return;
    }

    try {
      setAttendanceError("");
      setActionLoading(true);

      const response = await fetch(
        `${API_URL}/hospitals/${hospitalId}/doctors/${doctorId}/attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getHeaders(),
          },
          body: JSON.stringify({
            action,
            reason: breakReason.trim(),
            start: workingStart,
            end: workingEnd,
          }),
        }
      );

      await readResponse(response);

      setAttendanceError("");
      setBreakReason("");

      /*
       * Reload doctors so the attendance status changes
       * immediately in the dashboard.
       */
      try {
        const data = await fetchDoctors(
          hospitalId
        );

        const list = Array.isArray(
          data.doctors
        )
          ? data.doctors
          : [];

        setDoctors(list);
      } catch (doctorError) {
        console.error(
          "Reload doctors after attendance error:",
          doctorError
        );
      }

      await loadQueue(true);
    } catch (err) {
      console.error(
        "Doctor attendance error:",
        err
      );

      setAttendanceError(
        err.message ||
          "Attendance update failed."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ======================================================
  // HOSPITAL SELECTION
  // ======================================================

  const handleHospitalChange = (value) => {
    setHospitalId(value);

    /*
     * Do not show an old doctor's queue while the new
     * hospital is loading.
     */
    setDoctorId("");
    setDoctors([]);
    setCurrentToken(null);
    setQueue([]);
    setError("");
    setAttendanceError("");
  };

  // ======================================================
  // DOCTOR SELECTION
  // ======================================================

  const handleDoctorChange = (value) => {
    setDoctorId(value);

    /*
     * Do not keep the previous doctor's current token.
     * Queue polling will populate the new doctor's data.
     */
    setCurrentToken(null);
    setQueue([]);
    setError("");
    setAttendanceError("");
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* BACK */}
        <Link
          to="/"
          className="font-semibold text-blue-700 hover:text-blue-800"
        >
          ← Back to Home
        </Link>

        {/* HEADER */}
        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Hospital Staff
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Hospital Queue Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage doctors, attendance, patients and the
            live hospital queue.
          </p>
        </div>

        {/* GLOBAL ERROR */}
        {error && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {/* SELECTORS */}
        <section className="mt-8 grid gap-4 rounded-3xl border border-slate-300 bg-white p-6 shadow-sm md:grid-cols-3">
          <Select
            label="Hospital"
            value={hospitalId}
            onChange={handleHospitalChange}
            options={hospitals.map(
              (hospital) => ({
                value: hospital._id,
                label: hospital.name,
              })
            )}
            disabled={loadingHospitals}
          />

          <Select
            label="Doctor"
            value={doctorId}
            onChange={handleDoctorChange}
            options={doctors.map(
              (doctor) => ({
                value: doctor._id,
                label: `${doctor.name} - ${
                  doctor.specialization ||
                  "General"
                }`,
              })
            )}
            disabled={
              loadingDoctors ||
              !hospitalId
            }
          />

          <Select
            label="Counter"
            value={String(counter)}
            onChange={(value) =>
              setCounter(Number(value))
            }
            options={[
              {
                value: "1",
                label: "Counter 1",
              },
              {
                value: "2",
                label: "Counter 2",
              },
              {
                value: "3",
                label: "Counter 3",
              },
            ]}
          />
        </section>

        {/* MAIN DASHBOARD */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* DOCTOR ATTENDANCE */}
          <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Doctor Attendance
            </h2>

            <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm text-slate-700">
              <p className="font-semibold">
                Status
              </p>

              <p className="mt-1">
                {selectedDoctor?.attendanceStatus ||
                  "Present"}
              </p>

              {selectedDoctor?.isOnBreak && (
                <p className="mt-1 text-amber-700">
                  Break:{" "}
                  {selectedDoctor.breakReason ||
                    "Break"}
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton
                onClick={() =>
                  updateDoctorAttendance(
                    "check-in"
                  )
                }
                disabled={
                  actionLoading ||
                  !doctorId
                }
                className="bg-green-600 hover:bg-green-700"
              >
                Check In
              </ActionButton>

              <ActionButton
                onClick={() =>
                  updateDoctorAttendance(
                    "check-out"
                  )
                }
                disabled={
                  actionLoading ||
                  !doctorId
                }
                className="bg-slate-700 hover:bg-slate-800"
              >
                Check Out
              </ActionButton>

              <ActionButton
                onClick={() =>
                  updateDoctorAttendance(
                    "start-break"
                  )
                }
                disabled={
                  actionLoading ||
                  !doctorId
                }
                className="bg-amber-500 hover:bg-amber-600"
              >
                Start Break
              </ActionButton>

              <ActionButton
                onClick={() =>
                  updateDoctorAttendance(
                    "end-break"
                  )
                }
                disabled={
                  actionLoading ||
                  !doctorId
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                End Break
              </ActionButton>
            </div>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={breakReason}
                onChange={(event) =>
                  setBreakReason(
                    event.target.value
                  )
                }
                placeholder="Break reason"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="time"
                  value={workingStart}
                  onChange={(event) =>
                    setWorkingStart(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                <input
                  type="time"
                  value={workingEnd}
                  onChange={(event) =>
                    setWorkingEnd(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  updateDoctorAttendance(
                    "save-hours"
                  )
                }
                disabled={
                  actionLoading ||
                  !doctorId
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Working Hours
              </button>
            </div>

            {attendanceError && (
              <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                {attendanceError}
              </div>
            )}
          </section>

          {/* CREATE OFFLINE TOKEN */}
          <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Create Offline Token
            </h2>

            <input
              type="text"
              value={patientName}
              onChange={(event) =>
                setPatientName(
                  event.target.value
                )
              }
              placeholder="Patient name"
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="Phone optional"
              className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={createOfflineToken}
              disabled={
                actionLoading ||
                !hospitalId ||
                !doctorId
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />

              {actionLoading
                ? "Processing..."
                : "Create Offline Token"}
            </button>
          </section>
        </div>

        {/* CURRENT SERVING */}
        <section className="mt-8 rounded-3xl bg-blue-700 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold text-blue-200">
            CURRENT SERVING
          </p>

          <p className="mt-3 text-5xl font-black">
            {currentToken?.tokenNumber ||
              "None"}
          </p>

          <p className="mt-3 text-sm text-blue-100">
            {selectedHospital?.name ||
              "Hospital"}{" "}
            •{" "}
            {selectedDoctor?.name ||
              "Doctor"}
          </p>

          {currentToken && (
            <div className="mt-5 rounded-2xl bg-blue-600/70 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-blue-200">
                    Patient
                  </p>
                  <p className="mt-1 font-semibold">
                    {currentToken.patientName ||
                      currentToken.citizenName ||
                      "Patient"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-blue-200">
                    Counter
                  </p>
                  <p className="mt-1 font-semibold">
                    {currentToken.counter
                      ? `Counter ${currentToken.counter}`
                      : "Not assigned"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* REAL-TIME QUEUE CONTROL */}
        <section className="mt-8 rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Real-Time Queue Control
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                People waiting:{" "}
                <span className="font-semibold text-slate-700">
                  {waitingQueue.length}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadQueue(true)
              }
              disabled={
                loadingQueue ||
                !hospitalId ||
                !doctorId
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loadingQueue
                    ? "animate-spin"
                    : ""
                }`}
              />

              {loadingQueue
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() =>
                queueAction("next")
              }
              disabled={
                actionLoading ||
                !!currentToken ||
                waitingQueue.length === 0
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="h-4 w-4" />
              Call Next
            </button>

            <button
              type="button"
              onClick={() =>
                queueAction("complete")
              }
              disabled={
                actionLoading ||
                !currentToken
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete
            </button>

            <button
              type="button"
              onClick={() =>
                queueAction("skip")
              }
              disabled={
                actionLoading ||
                !currentToken
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </button>
          </div>
        </section>

        {/* UNIFIED QUEUE */}
        <section className="mt-8 rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Unified Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Live queue for the selected doctor
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
              LIVE
            </span>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {visibleQueue.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                No patients are currently waiting.
              </div>
            ) : (
              visibleQueue.map(
                (token, index) => {
                  const isServing =
                    currentToken?._id ===
                    token._id;

                  return (
                    <div
                      key={
                        token._id ||
                        `${token.tokenNumber}-${index}`
                      }
                      className={`flex items-center justify-between gap-4 py-4 ${
                        isServing
                          ? "rounded-xl bg-blue-50 px-4"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                          {isServing
                            ? "▶"
                            : index + 1}
                        </span>

                        <div>
                          <p className="font-bold text-slate-900">
                            {token.tokenNumber ||
                              "Token"}
                          </p>

                          <p className="text-sm text-slate-500">
                            {token.patientName ||
                              token.citizenName ||
                              "Patient"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                          isServing
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isServing
                          ? "SERVING"
                          : token.source ||
                            "ONLINE"}
                      </span>
                    </div>
                  );
                }
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

// ======================================================
// SELECT COMPONENT
// ======================================================

function Select({
  label,
  value,
  onChange,
  options,
  disabled = false,
}) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}

      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {options.length === 0 ? (
          <option value="">
            {disabled
              ? "Loading..."
              : `No ${label.toLowerCase()} available`}
          </option>
        ) : (
          options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))
        )}
      </select>
    </label>
  );
}

// ======================================================
// ACTION BUTTON
// ======================================================

function ActionButton({
  children,
  onClick,
  disabled,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export default HospitalDashboard;