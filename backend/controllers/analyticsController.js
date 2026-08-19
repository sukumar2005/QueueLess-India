const Service = require("../models/Service");
const Hospital = require("../models/Hospital");
const GovernmentOffice = require("../models/GovernmentOffice");
const Doctor = require("../models/Doctor");
const Officer = require("../models/Officer");
const Token = require("../models/Token");
const Notification = require("../models/Notification");

const getAnalyticsSummary = async (req, res) => {
  try {
    // =====================================================
    // LOAD DATA
    // =====================================================

    const [
      services,
      hospitals,
      offices,
      doctors,
      officers,
      tokens,
      notifications,
    ] = await Promise.all([
      Service.find(),
      Hospital.find(),
      GovernmentOffice.find(),
      Doctor.find(),
      Officer.find(),

      Token.find({
        status: {
          $in: [
            "waiting",
            "serving",
            "completed",
            "skipped",
          ],
        },
      }).populate("service"),

      Notification.find()
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    // =====================================================
    // BASIC COUNTS
    // =====================================================

    const totalServices = services.length;

    const totalHospitals = hospitals.length;

    const totalOffices = offices.length;

    const totalDoctors = doctors.length;

    const totalOfficers = officers.length;

    // =====================================================
    // ATTENDANCE
    // =====================================================

    const activeDoctors = doctors.filter(
      (doctor) =>
        doctor.attendanceStatus === "Present"
    ).length;

    const activeOfficers = officers.filter(
      (officer) =>
        officer.attendanceStatus === "Present"
    ).length;

    // =====================================================
    // TOKEN STATUS
    // =====================================================

    const totalTokens = tokens.length;

    const totalWaitingTokens = tokens.filter(
      (token) =>
        token.status === "waiting"
    ).length;

    const totalServingTokens = tokens.filter(
      (token) =>
        token.status === "serving"
    ).length;

    const totalCompletedTokens = tokens.filter(
      (token) =>
        token.status === "completed"
    ).length;

    const totalSkippedTokens = tokens.filter(
      (token) =>
        token.status === "skipped"
    ).length;

    // =====================================================
    // ONLINE / OFFLINE TOKENS
    // =====================================================

    const onlineTokens = tokens.filter(
      (token) =>
        token.source === "online"
    ).length;

    const offlineTokens = tokens.filter(
      (token) =>
        token.source === "offline"
    ).length;

    // =====================================================
    // TODAY'S TOKENS
    // =====================================================

    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const todayTokens = tokens.filter(
      (token) =>
        token.createdAt >= startOfDay &&
        token.createdAt < endOfDay
    );

    const todayTokenCount =
      todayTokens.length;

    const todayCompletedTokens =
      todayTokens.filter(
        (token) =>
          token.status === "completed"
      ).length;

    // =====================================================
    // COMPLETION RATE
    // =====================================================

    const processedTokens =
      totalCompletedTokens +
      totalSkippedTokens;

    const completionRate =
      processedTokens > 0
        ? Number(
            (
              (totalCompletedTokens /
                processedTokens) *
              100
            ).toFixed(2)
          )
        : 0;

   // =====================================================
// AVERAGE ACTUAL SERVICE TIME
// =====================================================

const completedWithTime = tokens.filter(
  (token) =>
    token.status === "completed" &&
    token.startedAt &&
    token.servedAt
);

let averageServiceTime = 0;

if (completedWithTime.length > 0) {
  const totalServiceTime = completedWithTime.reduce(
    (total, token) => {
      const start = new Date(
        token.startedAt
      ).getTime();

      const end = new Date(
        token.servedAt
      ).getTime();

      return total + (end - start);
    },
    0
  );

  averageServiceTime = Math.round(
    totalServiceTime /
      completedWithTime.length /
      60000
  );
}
// =====================================================
// AVERAGE WAITING TIME
// =====================================================

const tokensWithWaitingTime = tokens.filter(
  (token) =>
    token.createdAt &&
    token.startedAt
);

let averageWaitingTime = 0;

if (tokensWithWaitingTime.length > 0) {
  const totalWaitingTime =
    tokensWithWaitingTime.reduce(
      (total, token) => {
        const created = new Date(
          token.createdAt
        ).getTime();

        const started = new Date(
          token.startedAt
        ).getTime();

        return total + (started - created);
      },
      0
    );

  averageWaitingTime = Math.round(
    totalWaitingTime /
      tokensWithWaitingTime.length /
      60000
  );
}
    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    const unreadNotifications =
      notifications.filter(
        (notification) =>
          !notification.read
      ).length;

    // =====================================================
    // SERVICE-WISE QUEUE DATA
    // =====================================================

    const serviceQueueData = {};

    services.forEach((service) => {
      const serviceTokens =
        tokens.filter(
          (token) =>
            token.service?._id?.toString() ===
            service._id.toString()
        );

      serviceQueueData[
        service._id
      ] = {
        name: service.name,

        department:
          service.department,

        total:
          serviceTokens.length,

        waiting:
          serviceTokens.filter(
            (token) =>
              token.status ===
              "waiting"
          ).length,

        serving:
          serviceTokens.filter(
            (token) =>
              token.status ===
              "serving"
          ).length,

        completed:
          serviceTokens.filter(
            (token) =>
              token.status ===
              "completed"
          ).length,

        skipped:
          serviceTokens.filter(
            (token) =>
              token.status ===
              "skipped"
          ).length,
      };
    });

    // =====================================================
    // DAILY ANALYTICS
    // =====================================================

    const dailyStats = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setDate(
        date.getDate() - i
      );

      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      const dayEnd = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );

      const dayTokens =
        tokens.filter(
          (token) =>
            token.createdAt >=
              dayStart &&
            token.createdAt <
              dayEnd
        );

      dailyStats.push({
        date:
          dayStart
            .toISOString()
            .split("T")[0],

        total:
          dayTokens.length,

        completed:
          dayTokens.filter(
            (token) =>
              token.status ===
              "completed"
          ).length,

        waiting:
          dayTokens.filter(
            (token) =>
              token.status ===
              "waiting"
          ).length,

        serving:
          dayTokens.filter(
            (token) =>
              token.status ===
              "serving"
          ).length,

        skipped:
          dayTokens.filter(
            (token) =>
              token.status ===
              "skipped"
          ).length,
      });
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    res.json({
      success: true,

      summary: {
        totalServices,
        totalHospitals,
        totalOffices,

        totalDoctors,
        totalOfficers,

        activeDoctors,
        activeOfficers,

        totalTokens,

        totalWaitingTokens,
        totalServingTokens,
        totalCompletedTokens,
        totalSkippedTokens,

        onlineTokens,
        offlineTokens,

        todayTokenCount,
        todayCompletedTokens,

        completionRate,

averageServiceTime,

averageWaitingTime,

unreadNotifications,
      },

      serviceQueueData,

      dailyStats,

      recentNotifications:
        notifications.slice(
          0,
          10
        ),
    });
  } catch (error) {
    console.error(
      "Analytics summary error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAnalyticsSummary,
};