import {
  Clock3,
  RefreshCw,
  UserCheck,
  Users,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://queueless-india-a2ju.onrender.com/api";

/* =========================================================
   AUTH TOKEN
========================================================= */

function getAuthToken() {
  try {
    const raw =
      localStorage.getItem("queueless_session");

    if (!raw) {
      return null;
    }

    const session = JSON.parse(raw);

    return (
      session?.token ||
      session?.accessToken ||
      session?.authToken ||
      session?.jwt ||
      session?.user?.token ||
      session?.user?.accessToken ||
      null
    );
  } catch (error) {
    console.error(
      "Unable to read session:",
      error
    );

    return null;
  }
}

/* =========================================================
   SAVED OFFICE TOKEN
========================================================= */

function getSavedOfficeToken() {
  try {
    const raw =
      localStorage.getItem(
        "queueless_office_token"
      );

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error(
      "Unable to read office token:",
      error
    );

    return null;
  }
}

/* =========================================================
   EXTRACT ID SAFELY
========================================================= */

function extractId(value) {
  if (!value) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (typeof value === "object") {
    return (
      value?._id ||
      value?.id ||
      value?.$oid ||
      null
    );
  }

  return null;
}

/* =========================================================
   OFFICE LIVE QUEUE
========================================================= */

function OfficeLiveQueue() {
  const [queue, setQueue] =
    useState([]);

  const [currentToken, setCurrentToken] =
    useState(null);

  const [userToken, setUserToken] =
    useState(null);

  const [peopleAhead, setPeopleAhead] =
    useState(0);

  const [estimatedWait, setEstimatedWait] =
    useState(0);

  const [office, setOffice] =
    useState(null);

  const [officers, setOfficers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD LIVE QUEUE
  ======================================================= */

  const loadQueue = useCallback(
    async (manualRefresh = false) => {
      try {
        if (manualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        /* ---------------------------------------------------
           GET SAVED TOKEN
        --------------------------------------------------- */

        const savedToken =
          getSavedOfficeToken();

        if (!savedToken) {
          throw new Error(
            "No government office appointment was found. Please book an appointment first."
          );
        }

        console.log(
          "SAVED OFFICE TOKEN:",
          savedToken
        );

        /* ---------------------------------------------------
           DEMO TOKEN

           Demo tokens are created only in the browser and do not
           have a MongoDB ObjectId. Never send a demo token ID to
           the backend, otherwise Mongoose will throw:
           CastError: Cast to ObjectId failed.
        --------------------------------------------------- */

        if (savedToken?.demo === true) {
          const demoAhead = Number(
            savedToken?.demoPeopleAhead ??
              savedToken?.peopleAhead ??
              3
          );

          const demoWait = Number(
            savedToken?.demoEstimatedWait ??
              savedToken?.estimatedWaitingTime ??
              15
          );

          const demoQueue = Array.from(
            { length: Math.max(0, demoAhead) },
            (_, index) => ({
              _id: `demo-wait-${index + 1}`,
              tokenNumber: `DEMO-${String(index + 1).padStart(3, "0")}`,
              status: "waiting",
              demo: true,
            })
          );

          const demoUserToken = {
            ...savedToken,
            status: savedToken.status || "waiting",
            peopleAhead: demoAhead,
            estimatedTime: demoAhead * demoWait,
          };

          setQueue(demoQueue);
          setCurrentToken(null);
          setUserToken(demoUserToken);
          setPeopleAhead(demoAhead);
          setEstimatedWait(demoAhead * demoWait);
          setOffice(
            savedToken?.governmentOffice || null
          );
          setOfficers(
            savedToken?.officer
              ? [savedToken.officer]
              : []
          );

          // IMPORTANT: stop here. A demo token is not in MongoDB.
          return;
        }

        /* ---------------------------------------------------
           TOKEN ID
        --------------------------------------------------- */

        const tokenId =
          extractId(
            savedToken?._id
          ) ||
          extractId(
            savedToken?.id
          ) ||
          extractId(
            savedToken?.tokenId
          ) ||
          extractId(
            savedToken?.appointmentId
          );

        /* ---------------------------------------------------
           GOVERNMENT OFFICE
        --------------------------------------------------- */

        const officeObject =
          savedToken?.governmentOffice;

        let officeId =
          extractId(
            officeObject
          );

        if (!officeId) {
          officeId =
            extractId(
              savedToken?.governmentOfficeId
            );
        }

        if (!officeId) {
          officeId =
            extractId(
              savedToken?.officeId
            );
        }

        /* ---------------------------------------------------
           OFFICER
        --------------------------------------------------- */

        const officerObject =
          savedToken?.officer;

        const officerId =
          extractId(
            officerObject
          ) ||
          extractId(
            savedToken?.officerId
          );

        console.log(
          "OFFICE QUEUE IDENTIFIERS:",
          {
            tokenId,
            officeObject,
            officeId,
            officerObject,
            officerId,
          }
        );

        /* ---------------------------------------------------
           AUTHENTICATION
        --------------------------------------------------- */

        const authToken =
          getAuthToken();

        const headers = {
          "Content-Type":
            "application/json",
        };

        if (authToken) {
          headers.Authorization =
            `Bearer ${authToken}`;
        }

        /* ---------------------------------------------------
           BUILD QUERY
        --------------------------------------------------- */

        const params =
          new URLSearchParams();

        /*
         * IMPORTANT:
         *
         * If officeId exists, use it.
         *
         * If officeId DOES NOT exist but tokenId
         * exists, send tokenId.
         *
         * Backend can find the government office
         * from the token.
         */

        if (!officeId) {
          throw new Error(
            "Your appointment does not contain a valid government office ID."
          );
        }

        params.append(
          "officeId",
          officeId
        );

        if (officerId) {
          params.append(
            "officerId",
            officerId
          );
        }

        const requestUrl =
          `${API_URL}/government-offices/queue/status?${params.toString()}`;

        console.log(
          "LIVE QUEUE REQUEST:",
          requestUrl
        );

        /* ---------------------------------------------------
           API REQUEST
        --------------------------------------------------- */

        const response =
          await fetch(
            requestUrl,
            {
              method: "GET",
              headers,
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch (jsonError) {
          console.error(
            "Unable to parse queue response:",
            jsonError
          );
        }

        console.log(
          "LIVE QUEUE RESPONSE:",
          data
        );

        /* ---------------------------------------------------
           AUTH ERROR
        --------------------------------------------------- */

        if (
          response.status === 401
        ) {
          throw new Error(
            "Authentication required. Please login again before tracking your queue."
          );
        }

        /* ---------------------------------------------------
           OTHER API ERRORS
        --------------------------------------------------- */

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Unable to load government office queue."
          );
        }

        /* ---------------------------------------------------
           QUEUE DATA
        --------------------------------------------------- */

        const liveQueue =
          Array.isArray(data?.queue)
            ? data.queue
            : [];

        const waitingQueue =
          Array.isArray(
            data?.waitingQueue
          )
            ? data.waitingQueue
            : liveQueue.filter(
                (token) =>
                  token?.status ===
                  "waiting"
              );

        const servingQueue =
          Array.isArray(
            data?.servingQueue
          )
            ? data.servingQueue
            : liveQueue.filter(
                (token) =>
                  token?.status ===
                  "serving"
              );

        /* ---------------------------------------------------
           CURRENT TOKEN
        --------------------------------------------------- */

        const liveCurrentToken =
          data?.currentToken ||
          servingQueue[0] ||
          null;

        /* ---------------------------------------------------
           FIND MY TOKEN
        --------------------------------------------------- */

        let myToken = null;

        if (tokenId) {
          myToken =
            liveQueue.find(
              (token) =>
                String(
                  extractId(
                    token?._id
                  )
                ) ===
                String(tokenId)
            ) ||
            waitingQueue.find(
              (token) =>
                String(
                  extractId(
                    token?._id
                  )
                ) ===
                String(tokenId)
            ) ||
            servingQueue.find(
              (token) =>
                String(
                  extractId(
                    token?._id
                  )
                ) ===
                String(tokenId)
            );
        }

        /*
         * If backend didn't return our token in
         * active queue, keep the saved token.
         */

        if (!myToken) {
          myToken = savedToken;
        }

        /* ---------------------------------------------------
           PEOPLE AHEAD
        --------------------------------------------------- */

        let calculatedPeopleAhead = 0;

        if (
          myToken &&
          myToken.status === "waiting"
        ) {
          const myCreatedAt =
            myToken.createdAt
              ? new Date(
                  myToken.createdAt
                ).getTime()
              : null;

          if (myCreatedAt) {
            calculatedPeopleAhead =
              waitingQueue.filter(
                (token) => {
                  const createdAt =
                    token?.createdAt
                      ? new Date(
                          token.createdAt
                        ).getTime()
                      : null;

                  return (
                    createdAt &&
                    createdAt <
                      myCreatedAt
                  );
                }
              ).length;
          } else {
            const index =
              waitingQueue.findIndex(
                (token) =>
                  String(
                    extractId(
                      token?._id
                    )
                  ) ===
                  String(tokenId)
              );

            calculatedPeopleAhead =
              index >= 0
                ? index
                : 0;
          }
        } else {
          calculatedPeopleAhead = 0;
        }

        /*
         * Prefer backend value when available.
         */

        if (
          typeof data?.totalWaiting ===
          "number"
        ) {
          /*
           * Don't replace our exact position
           * calculation with totalWaiting.
           */
        }

        /* ---------------------------------------------------
           ESTIMATED WAIT
        --------------------------------------------------- */

        let averageServiceTime =
          Number(
            data?.averageServiceTime
          ) || 15;

        if (
          !Number.isFinite(
            averageServiceTime
          ) ||
          averageServiceTime <= 0
        ) {
          averageServiceTime = 15;
        }

        const calculatedWait =
          Math.max(
            0,
            Math.ceil(
              calculatedPeopleAhead *
                averageServiceTime
            )
          );

        /* ---------------------------------------------------
           UPDATE STATE
        --------------------------------------------------- */

        setQueue(
          liveQueue
        );

        setCurrentToken(
          liveCurrentToken
        );

        setUserToken(
          myToken
        );

        setPeopleAhead(
          calculatedPeopleAhead
        );

        setEstimatedWait(
          calculatedWait
        );

        setOffice(
          data?.office ||
            savedToken?.governmentOffice ||
            null
        );

        setOfficers(
          Array.isArray(
            data?.officers
          )
            ? data.officers
            : []
        );
      } catch (err) {
        console.error(
          "Live queue error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load government office queue."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* =======================================================
   INITIAL LOAD + LIVE REFRESH
======================================================= */

useEffect(() => {
  /*
   * Start the first queue load asynchronously.
   * This avoids triggering a synchronous state update
   * directly from the effect body.
   */
  const initialLoadTimer = setTimeout(() => {
    loadQueue();
  }, 0);

  /*
   * Refresh the live queue every 5 seconds.
   */
  const interval = setInterval(() => {
    loadQueue();
  }, 5000);

  /*
   * CLEANUP
   *
   * Stop both timers when the page is closed/unmounted.
   */
  return () => {
    clearTimeout(initialLoadTimer);
    clearInterval(interval);
  };
}, [loadQueue]);

  /* =======================================================
     MANUAL REFRESH
  ======================================================= */

  const handleRefresh = () => {
    loadQueue(true);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <RefreshCw
              className="mx-auto mb-4 animate-spin text-blue-600"
              size={36}
            />

            <h2 className="text-xl font-bold text-slate-900">
              Loading live queue...
            </h2>

            <p className="mt-2 text-slate-500">
              Getting the latest government office queue status.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !userToken) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/government-offices"
            className="mb-6 inline-flex items-center gap-2 font-semibold text-blue-700"
          >
            <ArrowLeft size={18} />
            Back to Government Offices
          </Link>

          <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle
                  className="text-red-600"
                  size={26}
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-red-700">
                  Unable to load office queue
                </h2>

                <p className="mt-2 text-slate-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     DISPLAY DATA
  ======================================================= */

  const officeName =
    office?.name ||
    userToken?.governmentOffice
      ?.name ||
    "Government Office";

  const currentTokenNumber =
    currentToken?.tokenNumber ||
    "—";

  const myTokenNumber =
    userToken?.tokenNumber ||
    "—";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <Link
              to="/government-offices"
              className="mb-3 inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-800"
            >
              <ArrowLeft size={18} />
              Back
            </Link>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Government Office Live Queue
            </h1>

            <p className="mt-2 text-slate-500">
              {officeName}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* =================================================
            ERROR BANNER
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Queue update warning
              </p>

              <p className="text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            MY TOKEN
        ================================================= */}

        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-3">
              <UserCheck
                className="text-blue-700"
                size={25}
              />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Your Token
              </p>

              <h2 className="text-4xl font-black text-slate-900">
                {myTokenNumber}
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Status
              </p>

              <p className="mt-1 text-lg font-bold capitalize text-slate-900">
                {userToken?.status ||
                  "Waiting"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                People Ahead
              </p>

              <p className="mt-1 text-2xl font-black text-slate-900">
                {peopleAhead}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Estimated Wait
              </p>

              <p className="mt-1 text-2xl font-black text-slate-900">
                {estimatedWait} min
              </p>
            </div>

          </div>

          {userToken?.status ===
            "serving" && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-green-50 p-4 text-green-800">
              <CheckCircle2
                size={22}
              />

              <div>
                <p className="font-bold">
                  It's your turn!
                </p>

                <p className="text-sm">
                  Please proceed to your assigned counter.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            CURRENTLY SERVING
        ================================================= */}

        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-green-100 p-3">
              <CheckCircle2
                className="text-green-700"
                size={24}
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Currently Serving
              </h2>

              <p className="text-sm text-slate-500">
                Live counter status
              </p>
            </div>
          </div>

          {currentToken ? (
            <div className="rounded-2xl bg-slate-50 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Current Token
                  </p>

                  <p className="mt-1 text-4xl font-black text-slate-900">
                    {currentTokenNumber}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-500">
                    Counter
                  </p>

                  <p className="text-xl font-bold text-slate-900">
                    {currentToken?.counter ||
                      "Not assigned"}
                  </p>
                </div>

              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              No token is currently being served.
            </div>
          )}
        </section>

        {/* =================================================
            QUEUE
        ================================================= */}

        <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">

              <div className="rounded-2xl bg-blue-100 p-3">
                <Users
                  className="text-blue-700"
                  size={24}
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Live Queue
                </h2>

                <p className="text-sm text-slate-500">
                  {queue.length} active token
                  {queue.length === 1
                    ? ""
                    : "s"}
                </p>
              </div>

            </div>
          </div>

          {queue.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-10 text-center">
              <Users
                className="mx-auto mb-3 text-slate-400"
                size={40}
              />

              <p className="font-semibold text-slate-700">
                No active tokens
              </p>

              <p className="mt-1 text-sm text-slate-500">
                The queue is currently empty.
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {queue.map(
                (token, index) => {
                  const isMyToken =
                    userToken &&
                    String(
                      extractId(
                        token?._id
                      )
                    ) ===
                      String(
                        extractId(
                          userToken?._id
                        ) ||
                          extractId(
                            userToken?.id
                          )
                      );

                  return (
                    <div
                      key={
                        token?._id ||
                        token?.id ||
                        index
                      }
                      className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
                        isMyToken
                          ? "border-blue-300 bg-blue-50"
                          : "border-slate-100 bg-slate-50"
                      }`}
                    >

                      <div className="flex items-center gap-4">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-slate-500 shadow-sm">
                          {index + 1}
                        </div>

                        <div>
                          <p className="text-xl font-black text-slate-900">
                            {token?.tokenNumber ||
                              "—"}
                          </p>

                          <p className="text-sm text-slate-500">
                            {token?.officer
                              ?.name ||
                              "Officer not assigned"}
                          </p>
                        </div>

                      </div>

                      <div className="flex items-center gap-4">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            token?.status ===
                            "serving"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {token?.status ||
                            "waiting"}
                        </span>

                        {isMyToken && (
                          <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white">
                            You
                          </span>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}
        </section>

        {/* =================================================
            OFFICERS
        ================================================= */}

        {officers.length > 0 && (
          <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-5 flex items-center gap-3">
              <Clock3
                className="text-blue-600"
                size={23}
              />

              <h2 className="text-xl font-bold text-slate-900">
                Office Counters
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {officers.map(
                (officer) => (
                  <div
                    key={
                      officer?._id ||
                      officer?.id
                    }
                    className="rounded-2xl bg-slate-50 p-5"
                  >
                    <div className="flex items-center justify-between">

                      <div>
                        <p className="font-bold text-slate-900">
                          {officer?.name ||
                            "Officer"}
                        </p>

                        <p className="text-sm text-slate-500">
                          Counter{" "}
                          {officer?.counter ||
                            "—"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">
                          {officer?.waitingCount ||
                            0}
                        </p>

                        <p className="text-xs text-slate-500">
                          waiting
                        </p>
                      </div>

                    </div>
                  </div>
                )
              )}

            </div>
          </section>
        )}

      </div>
    </main>
  );
}

export default OfficeLiveQueue;