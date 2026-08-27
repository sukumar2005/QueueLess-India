import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://queueless-india-a2ju.onrender.com/api";

function readSession() {
  try {
    return JSON.parse(
      localStorage.getItem("queueless_session") || "null"
    );
  } catch {
    return null;
  }
}

function getToken(session) {
  return (
    session?.token ||
    session?.accessToken ||
    session?.authToken ||
    session?.jwt ||
    session?.user?.token ||
    session?.user?.accessToken ||
    null
  );
}

function getId(value) {
  if (!value) return null;

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    return value?._id || value?.id || value?.$oid || null;
  }

  return null;
}

function OfficeDashboard({ session: sessionProp }) {
  const [session] = useState(() => sessionProp || readSession());

  const [officeId, setOfficeId] = useState(
    getId(session?.officeId) ||
    getId(session?.user?.officeId)
  );

  const [office, setOffice] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState(
    getId(session?.officerId) ||
    getId(session?.user?.officerId)
  );

  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);

  const [officeOpen, setOfficeOpen] = useState(false);
  const [onBreak, setOnBreak] = useState(false);

  const [completedToday, setCompletedToday] = useState(0);
  const [skippedToday, setSkippedToday] = useState(0);

  const [offlineName, setOfflineName] = useState("");
  const [offlineService, setOfflineService] = useState("");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const authHeaders = useMemo(() => {
    const token = getToken(session);

    return {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    };
  }, [session]);

  const selectedOfficer = officers.find(
    (item) => String(item._id) === String(selectedOfficerId)
  );

  // ==========================================================
  // LOAD OFFICE
  // ==========================================================

  const loadOffice = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/government-offices`,
        { headers: authHeaders }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to load government offices."
        );
      }

      const list = Array.isArray(data?.offices)
        ? data.offices
        : [];

      if (!officeId && list.length > 0) {
        setOfficeId(getId(list[0]));
      }

      const selected =
        list.find(
          (item) => String(item._id) === String(officeId)
        ) || list[0];

      if (selected) {
        setOffice(selected);
        if (!officeId) {
          setOfficeId(getId(selected));
        }
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load government office."
      );
    }
  }, [authHeaders, officeId]);

  // ==========================================================
  // LOAD OFFICERS
  // ==========================================================

  const loadOfficers = useCallback(async () => {
    if (!officeId) return;

    try {
      const response = await fetch(
        `${API_URL}/government-offices/${officeId}/officers`,
        { headers: authHeaders }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to load government officers."
        );
      }

      const list = Array.isArray(data?.officers)
        ? data.officers
        : [];

      setOfficers(list);

      if (
        selectedOfficerId &&
        list.some(
          (item) =>
            String(item._id) ===
            String(selectedOfficerId)
        )
      ) {
        return;
      }

      if (list.length > 0) {
        setSelectedOfficerId(getId(list[0]));
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load government officers."
      );
    }
  }, [authHeaders, officeId, selectedOfficerId]);

  // ==========================================================
  // LOAD LIVE QUEUE
  // ==========================================================

  const loadQueue = useCallback(async (manual = false) => {
    if (!officeId) return;

    try {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      params.set("officeId", officeId);

      const response = await fetch(
        `${API_URL}/government-offices/queue/status?${params.toString()}`,
        { headers: authHeaders }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to load office queue."
        );
      }

      setOffice(data?.office || null);
      setQueue(
        Array.isArray(data?.queue)
          ? data.queue
          : []
      );
      setCurrentToken(
        data?.currentToken || null
      );
      setCompletedToday(
        Number(data?.completedToday) || 0
      );
      setSkippedToday(
        Number(data?.skippedToday) || 0
      );

      if (selectedOfficerId) {
        const officerFromResponse =
          Array.isArray(data?.officers)
            ? data.officers.find(
                (item) =>
                  String(item._id) ===
                  String(selectedOfficerId)
              )
            : null;

        if (officerFromResponse) {
          setOfficeOpen(
            officerFromResponse.attendanceStatus ===
              "Present" &&
            !officerFromResponse.isOnBreak
          );

          setOnBreak(
            Boolean(
              officerFromResponse.isOnBreak
            )
          );
        }
      }

      setError("");
    } catch (err) {
      console.error("Office queue error:", err);

      setError(
        err?.message ||
          "Unable to load office queue."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authHeaders, officeId, selectedOfficerId]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOffice();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadOffice]);

  useEffect(() => {
    if (!officeId) return undefined;

    const timer = setTimeout(() => {
      void loadOfficers();
      void loadQueue();
    }, 0);

    const interval = setInterval(() => {
      void loadQueue();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [officeId, loadOfficers, loadQueue]);

  // ==========================================================
  // ATTENDANCE
  // ==========================================================

  const updateAttendance = async (
    action
  ) => {
    if (!officeId || !selectedOfficerId) {
      setError(
        "No government officer is assigned to this account."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      let attendanceStatus = undefined;
      let isOnBreak = undefined;
      let breakReason = "";

      if (action === "checkin") {
        attendanceStatus = "Present";
        isOnBreak = false;
      } else if (action === "checkout") {
        attendanceStatus = "Absent";
        isOnBreak = false;
      } else if (action === "break-start") {
        attendanceStatus = "Present";
        isOnBreak = true;
        breakReason = "Break";
      } else if (action === "break-end") {
        attendanceStatus = "Present";
        isOnBreak = false;
      }

      const response = await fetch(
        `${API_URL}/government-offices/${officeId}/officers/${selectedOfficerId}/attendance`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            attendanceStatus,
            isOnBreak,
            breakReason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to update officer attendance."
        );
      }

      if (action === "checkin") {
        setOfficeOpen(true);
        setOnBreak(false);
        setMessage(
          "Officer checked in successfully."
        );
      } else if (action === "checkout") {
        setOfficeOpen(false);
        setOnBreak(false);
        setCurrentToken(null);
        setMessage("Officer checked out.");
      } else if (action === "break-start") {
        setOnBreak(true);
        setMessage("Officer is now on break.");
      } else if (action === "break-end") {
        setOnBreak(false);
        setMessage("Break ended.");
      }

      await loadOfficers();
      await loadQueue();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // CALL NEXT
  // ==========================================================

  const handleCallNext = async () => {
    if (!officeOpen) {
      setError(
        "Please check in before calling a token."
      );
      return;
    }

    if (onBreak) {
      setError(
        "End your break before calling the next token."
      );
      return;
    }

    if (currentToken) {
      setError(
        "Complete or skip the current citizen first."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/government-offices/queue/next`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            officeId,
            officerId: selectedOfficerId,
            counter:
              selectedOfficer?.counter || 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to call next citizen."
        );
      }

      const next =
        data?.token ||
        data?.currentToken ||
        null;

      setCurrentToken(next);

      setMessage(
        next
          ? `${next.tokenNumber} has been called.`
          : "No waiting citizens."
      );

      await loadQueue();
      await loadOfficers();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to call next citizen."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // COMPLETE
  // ==========================================================

  const handleComplete = async () => {
    if (!currentToken) return;

    const tokenId =
      getId(currentToken?._id) ||
      getId(currentToken?.id);

    if (!tokenId) {
      setError("Current token has no valid ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/government-offices/queue/complete`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            tokenId,
            officerId: selectedOfficerId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to complete token."
        );
      }

      setCurrentToken(null);
      setMessage("Token completed successfully.");

      await loadQueue();
      await loadOfficers();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to complete token."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // SKIP
  // ==========================================================

  const handleSkip = async () => {
    if (!currentToken) return;

    const tokenId =
      getId(currentToken?._id) ||
      getId(currentToken?.id);

    if (!tokenId) {
      setError("Current token has no valid ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/government-offices/queue/skip`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            tokenId,
            officerId: selectedOfficerId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to skip token."
        );
      }

      setCurrentToken(null);
      setMessage("Token skipped.");

      await loadQueue();
      await loadOfficers();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to skip token."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // OFFLINE / WALK-IN TOKEN
  // ==========================================================

  const handleOfflineToken = async (event) => {
    event.preventDefault();

    if (!officeOpen) {
      setError(
        "Please check in before creating a token."
      );
      return;
    }

    if (!selectedOfficerId) {
      setError(
        "No government officer is available."
      );
      return;
    }

    if (!offlineName.trim()) {
      setError("Enter citizen name.");
      return;
    }

    if (!offlineService.trim()) {
      setError("Enter service required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/government-offices/tokens`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            officeId,
            officerId: selectedOfficerId,
            citizenName: offlineName.trim(),
            purpose: offlineService.trim(),
            source: "offline",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to create offline token."
        );
      }

      setOfflineName("");
      setOfflineService("");

      setMessage(
        `Offline token ${
          data?.token?.tokenNumber || ""
        } created successfully.`
      );

      await loadQueue();
      await loadOfficers();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to create offline token."
      );
    } finally {
      setLoading(false);
    }
  };

  const waitingQueue = queue.filter(
    (item) =>
      item?.status === "waiting" ||
      item?.status === "WAITING"
  );

  const officeName =
    office?.name ||
    "Government Office";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              Government Services
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Office Operations
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {officeName} Officer Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                officeOpen
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {officeOpen
                ? "● Office Open"
                : "● Office Closed"}
            </div>

            <button
              type="button"
              onClick={() => void loadQueue(true)}
              disabled={refreshing}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-medium text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Officer
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {selectedOfficer?.name ||
                  session?.name ||
                  "Government Officer"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedOfficer?.designation ||
                  session?.username ||
                  "Officer account"}
              </p>

              {officers.length > 1 && (
                <select
                  value={selectedOfficerId || ""}
                  onChange={(event) => {
                    setSelectedOfficerId(
                      event.target.value
                    );
                    setCurrentToken(null);
                  }}
                  className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
                >
                  {officers.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.name} — Counter{" "}
                      {item.counter || 1}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {!officeOpen ? (
                <button
                  type="button"
                  onClick={() =>
                    void updateAttendance("checkin")
                  }
                  disabled={loading}
                  className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Check In
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    void updateAttendance("checkout")
                  }
                  disabled={loading}
                  className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-900 disabled:opacity-50"
                >
                  Check Out
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  void updateAttendance(
                    onBreak
                      ? "break-end"
                      : "break-start"
                  )
                }
                disabled={!officeOpen || loading}
                className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 font-semibold text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {onBreak
                  ? "End Break"
                  : "Start Break"}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Stat
            label="Waiting"
            value={waitingQueue.length}
            className="text-blue-700"
          />

          <Stat
            label="Current Token"
            value={
              currentToken?.tokenNumber || "—"
            }
          />

          <Stat
            label="Completed Today"
            value={completedToday}
            className="text-green-600"
          />

          <Stat
            label="Skipped Today"
            value={skippedToday}
            className="text-amber-600"
          />
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                Service Counter
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Current Citizen
              </h2>

              {currentToken ? (
                <div className="mt-4">
                  <p className="text-5xl font-black text-blue-700">
                    {currentToken.tokenNumber}
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-800">
                    {currentToken.citizenName ||
                      "Citizen"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {currentToken.problem ||
                      currentToken.service?.name ||
                      "Government Service"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Counter{" "}
                    {currentToken.counter ||
                      selectedOfficer?.counter ||
                      1}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-slate-500">
                  No citizen is currently being served.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  void handleCallNext()
                }
                disabled={
                  loading ||
                  !officeOpen ||
                  onBreak ||
                  !!currentToken ||
                  !selectedOfficerId
                }
                className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : "Call Next"}
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleComplete()
                }
                disabled={loading || !currentToken}
                className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Complete
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleSkip()
                }
                disabled={loading || !currentToken}
                className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Skip
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Walk-In Citizen
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Create Offline Token
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add a citizen who arrived directly at the office.
          </p>

          <form
            onSubmit={handleOfflineToken}
            className="mt-5 grid gap-4 md:grid-cols-3"
          >
            <input
              value={offlineName}
              onChange={(event) =>
                setOfflineName(
                  event.target.value
                )
              }
              placeholder="Citizen name"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              value={offlineService}
              onChange={(event) =>
                setOfflineService(
                  event.target.value
                )
              }
              placeholder="Service required"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={
                loading ||
                !officeOpen ||
                !selectedOfficerId
              }
              className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create Token
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                Live Queue
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Citizens Waiting
              </h2>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {waitingQueue.length} waiting
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-4 py-3">Token</th>
                  <th className="px-4 py-3">Citizen</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Officer</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {queue.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      No active queue entries.
                    </td>
                  </tr>
                ) : (
                  queue.map((item) => (
                    <tr
                      key={
                        item._id ||
                        item.tokenNumber
                      }
                      className="border-b border-slate-100"
                    >
                      <td className="px-4 py-4 font-bold text-blue-700">
                        {item.tokenNumber || "—"}
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-800">
                        {item.citizenName ||
                          "Citizen"}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {item.problem ||
                          item.service?.name ||
                          "Government Service"}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {item.officer?.name ||
                          "Assigned"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status ===
                            "serving"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.status ||
                            "waiting"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  className = "text-slate-900",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${className}`}
      >
        {value}
      </p>
    </div>
  );
}

export default OfficeDashboard;
