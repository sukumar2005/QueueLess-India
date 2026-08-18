import { useCallback, useEffect, useState } from "react";

const Complaints = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  // =========================================================
  // GET USER ROLE
  // =========================================================

  const [userRole] = useState(() => {
    try {
      const session = JSON.parse(
        localStorage.getItem("queueless_session") || "{}"
      );

      return session.role || "";
    } catch (error) {
      console.error("Session parsing error:", error);
      return "";
    }
  });

  // =========================================================
  // LOAD COMPLAINTS
  // =========================================================

  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const session = JSON.parse(
        localStorage.getItem("queueless_session") || "{}"
      );

      const token = session.token || "";

      let url = "/api/v1/complaints";

      if (filter !== "all") {
        url += `?status=${encodeURIComponent(filter)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load complaints"
        );
      }

      if (data.success) {
        setComplaints(data.complaints || []);
      } else {
        setComplaints([]);
        setError(
          data.message || "Unable to load complaints"
        );
      }
    } catch (error) {
      console.error("Load complaints error:", error);

      setError(
        error.message ||
          "Unable to connect to the complaint service."
      );

      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // =========================================================
  // LOAD COMPLAINTS WHEN PAGE OPENS
  //
  // setTimeout prevents the React ESLint
  // set-state-in-effect warning.
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      loadComplaints();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadComplaints]);

  // =========================================================
  // UPDATE COMPLAINT STATUS
  // =========================================================

  const updateComplaintStatus = async (
    complaintId,
    status
  ) => {
    try {
      const session = JSON.parse(
        localStorage.getItem("queueless_session") || "{}"
      );

      const token = session.token || "";

      const response = await fetch(
        `/api/v1/complaints/${complaintId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update complaint"
        );
      }

      if (data.success) {
        loadComplaints();
      } else {
        alert(
          data.message ||
            "Unable to update complaint"
        );
      }
    } catch (error) {
      console.error(
        "Update complaint error:",
        error
      );

      alert(
        error.message ||
          "Unable to update complaint."
      );
    }
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusClasses = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "investigating":
        return "bg-blue-100 text-blue-700";

      case "resolved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    try {
      return new Date(date).toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    } catch {
      return "—";
    }
  };

  // =========================================================
  // COMPLAINT TITLE
  // =========================================================

  const getComplaintTitle = (complaint) => {
    return (
      complaint.title ||
      complaint.subject ||
      complaint.type ||
      "Service Complaint"
    );
  };

  // =========================================================
  // COMPLAINT DESCRIPTION
  // =========================================================

  const getComplaintDescription = (
    complaint
  ) => {
    return (
      complaint.description ||
      complaint.message ||
      "No description provided."
    );
  };

  // =========================================================
  // CITIZEN NAME
  // =========================================================

  const getCitizenName = (complaint) => {
    if (complaint.citizenName) {
      return complaint.citizenName;
    }

    if (complaint.user?.name) {
      return complaint.user.name;
    }

    if (complaint.user?.fullName) {
      return complaint.user.fullName;
    }

    return "Citizen";
  };

  // =========================================================
  // SERVICE NAME
  // =========================================================

  const getServiceName = (complaint) => {
    if (complaint.service?.name) {
      return complaint.service.name;
    }

    if (complaint.serviceName) {
      return complaint.serviceName;
    }

    if (complaint.office?.name) {
      return complaint.office.name;
    }

    if (complaint.hospital?.name) {
      return complaint.hospital.name;
    }

    return "Public Service";
  };

  // =========================================================
  // CHECK WHETHER USER CAN MANAGE COMPLAINTS
  // =========================================================

  const canManageComplaints = [
    "admin",
    "authority",
    "hospital",
    "government_office",
  ].includes(userRole);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                QueueLess India
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Complaints
              </h1>

              <p className="mt-1 text-slate-500">
                Manage and track citizen complaints.
              </p>
            </div>

            <button
              type="button"
              onClick={loadComplaints}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* ===================================================
            ROLE
        ==================================================== */}

        {userRole && (
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
            <p className="text-sm text-blue-700">
              Logged in as{" "}
              <span className="font-bold">
                {userRole}
              </span>
            </p>
          </div>
        )}

        {/* ===================================================
            FILTER
        ==================================================== */}

        <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Complaint Status
              </h2>

              <p className="text-sm text-slate-500">
                Filter complaints by their current status.
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">
                All Complaints
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="investigating">
                Investigating
              </option>

              <option value="resolved">
                Resolved
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>
          </div>
        </div>

        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="font-semibold text-red-700">
              Unable to load complaints
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={loadComplaints}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 font-medium text-slate-700">
              Loading complaints...
            </p>
          </div>
        )}

        {/* ===================================================
            EMPTY
        ==================================================== */}

        {!loading &&
          complaints.length === 0 && (
            <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                📋
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                No complaints found
              </h2>

              <p className="mt-2 text-slate-500">
                There are no complaints matching
                the selected filter.
              </p>
            </div>
          )}

        {/* ===================================================
            COMPLAINT LIST
        ==================================================== */}

        {!loading &&
          complaints.length > 0 && (
            <div className="space-y-5">
              {complaints.map((complaint) => {
                const complaintId =
                  complaint._id ||
                  complaint.id;

                return (
                  <div
                    key={complaintId}
                    className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    {/* TOP */}

                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold text-slate-900">
                            {getComplaintTitle(
                              complaint
                            )}
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClasses(
                              complaint.status
                            )}`}
                          >
                            {complaint.status ||
                              "pending"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Complaint ID:{" "}
                          <span className="font-medium text-slate-700">
                            {complaintId || "—"}
                          </span>
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Submitted
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {formatDate(
                            complaint.createdAt ||
                              complaint.created_at
                          )}
                        </p>
                      </div>
                    </div>

                    {/* INFORMATION */}

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Citizen
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {getCitizenName(
                            complaint
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Service
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {getServiceName(
                            complaint
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Priority
                        </p>

                        <p className="mt-1 font-semibold capitalize text-slate-800">
                          {complaint.priority ||
                            "Normal"}
                        </p>
                      </div>
                    </div>

                    {/* DESCRIPTION */}

                    <div className="mt-5 rounded-xl border border-slate-200 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Complaint Description
                      </p>

                      <p className="mt-2 leading-7 text-slate-700">
                        {getComplaintDescription(
                          complaint
                        )}
                      </p>
                    </div>

                    {/* RESOLUTION */}

                    {complaint.resolution && (
                      <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                          Resolution
                        </p>

                        <p className="mt-2 text-green-800">
                          {complaint.resolution}
                        </p>
                      </div>
                    )}

                    {/* ACTIONS */}

                    {canManageComplaints && (
                      <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
                        {complaint.status !==
                          "investigating" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateComplaintStatus(
                                complaintId,
                                "investigating"
                              )
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Investigate
                          </button>
                        )}

                        {complaint.status !==
                          "resolved" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateComplaintStatus(
                                complaintId,
                                "resolved"
                              )
                            }
                            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                          >
                            Mark Resolved
                          </button>
                        )}

                        {complaint.status !==
                          "rejected" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateComplaintStatus(
                                complaintId,
                                "rejected"
                              )
                            }
                            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </main>
    </div>
  );
};

export default Complaints;