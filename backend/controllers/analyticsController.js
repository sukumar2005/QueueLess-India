const Service = require("../models/Service");
const Hospital = require("../models/Hospital");
const GovernmentOffice = require("../models/GovernmentOffice");
const Doctor = require("../models/Doctor");
const Officer = require("../models/Officer");
const Token = require("../models/Token");
const Notification = require("../models/Notification");

const getAnalyticsSummary = async (req, res) => {
  try {
    const [services, hospitals, offices, doctors, officers, tokens, notifications] =
      await Promise.all([
        Service.find(),
        Hospital.find(),
        GovernmentOffice.find(),
        Doctor.find(),
        Officer.find(),
        Token.find({ status: { $in: ["waiting", "serving", "completed"] } }).populate("service"),
        Notification.find().sort({ createdAt: -1 }).limit(50),
      ]);

    const totalServices = services.length;
    const totalHospitals = hospitals.length;
    const totalOffices = offices.length;

    const activeDoctors = doctors.filter((d) => d.attendanceStatus === "Present").length;
    const activeOfficers = officers.filter((o) => o.attendanceStatus === "Present").length;

    const totalWaitingTokens = tokens.filter((t) => t.status === "waiting").length;
    const totalServingTokens = tokens.filter((t) => t.status === "serving").length;
    const totalCompletedTokens = tokens.filter((t) => t.status === "completed").length;

    const unreadNotifications = notifications.filter((n) => !n.read).length;

    const serviceQueueData = {};

    services.forEach((service) => {
      const serviceTokens = tokens.filter((t) => t.service?._id?.toString() === service._id.toString());
      serviceQueueData[service._id] = {
        name: service.name,
        department: service.department,
        waiting: serviceTokens.filter((t) => t.status === "waiting").length,
        serving: serviceTokens.filter((t) => t.status === "serving").length,
        completed: serviceTokens.filter((t) => t.status === "completed").length,
      };
    });

    res.json({
      success: true,
      summary: {
        totalServices,
        totalHospitals,
        totalOffices,
        activeDoctors,
        activeOfficers,
        totalDoctors: doctors.length,
        totalOfficers: officers.length,
        totalWaitingTokens,
        totalServingTokens,
        totalCompletedTokens,
        unreadNotifications,
      },
      serviceQueueData,
      recentNotifications: notifications.slice(0, 10),
    });
  } catch (error) {
    console.error("Analytics summary error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAnalyticsSummary,
};
