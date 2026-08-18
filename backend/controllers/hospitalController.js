const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const Token = require("../models/Token");

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

const addMinutes = (minutes) => {
  const date = new Date(Date.now() + minutes * 60000);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ensureHospitalData = async () => {
  const count = await Hospital.countDocuments();

  if (count > 0) {
    return;
  }

  const hospitals = await Hospital.insertMany([
    {
      name: "Government Hospital, Coimbatore",
      state: "Tamil Nadu",
      district: "Coimbatore",
      village: "Coimbatore",
      address: "Trichy Road, Coimbatore",
      latitude: 11.0168,
      longitude: 76.9558,
      available: true,
    },
    {
      name: "District Hospital, Coimbatore",
      state: "Tamil Nadu",
      district: "Coimbatore",
      village: "Coimbatore",
      address: "Gandhipuram, Coimbatore",
      latitude: 11.018,
      longitude: 76.967,
      available: true,
    },
    {
      name: "Government Hospital, Pollachi",
      state: "Tamil Nadu",
      district: "Coimbatore",
      village: "Pollachi",
      address: "Pollachi Main Road",
      available: true,
    },
    {
      name: "Government General Hospital, Vijayawada",
      state: "Andhra Pradesh",
      district: "Krishna",
      village: "Vijayawada",
      address: "Vijayawada",
      available: true,
    },
  ]);

  await Doctor.insertMany([
    {
      name: "Dr. Arun",
      specialization: "General Medicine",
      hospital: hospitals[0]._id,
      room: "204",
      available: true,
      currentPatients: 5,
      averageConsultationTime: 15,
      problems: ["Fever", "Cold", "Cough", "General Checkup"],
    },
    {
      name: "Dr. Meena",
      specialization: "Dermatology",
      hospital: hospitals[0]._id,
      room: "112",
      available: false,
      expectedArrival: "11:30 AM",
      currentPatients: 0,
      averageConsultationTime: 20,
      problems: ["Skin Problem", "Other"],
    },
    {
      name: "Dr. Kiran",
      specialization: "Emergency Medicine",
      hospital: hospitals[1]._id,
      room: "101",
      available: true,
      currentPatients: 3,
      averageConsultationTime: 12,
      problems: ["Chest Pain", "Injury", "Stomach Pain"],
    },
    {
      name: "Dr. Lakshmi",
      specialization: "General Medicine",
      hospital: hospitals[2]._id,
      room: "18",
      available: true,
      currentPatients: 2,
      averageConsultationTime: 15,
      problems: ["Diabetes", "Blood Pressure", "Headache"],
    },
    {
      name: "Dr. Prasad",
      specialization: "General Medicine",
      hospital: hospitals[3]._id,
      room: "32",
      available: true,
      currentPatients: 4,
      averageConsultationTime: 15,
      problems: ["Fever", "Cold", "Cough", "General Checkup"],
    },
  ]);
};

const getHospitals = async (req, res) => {
  try {
    await ensureHospitalData();

    const { state, district, village } = req.query;
    const filter = {};

    if (req.user && req.user.role === "HOSPITAL" && req.user.hospitalId) {
      filter._id = req.user.hospitalId;
    }

    if (state) filter.state = state;
    if (district) filter.district = district;
    if (village) filter.village = village;

    const hospitals = await Hospital.find(filter).sort({ name: 1 });

    const results = await Promise.all(
      hospitals.map(async (hospital) => {
        const [availableDoctors, waitingCount] = await Promise.all([
          Doctor.countDocuments({
            hospital: hospital._id,
            available: true,
          }),
          Token.countDocuments({
            tokenType: "hospital",
            hospital: hospital._id,
            status: "waiting",
          }),
        ]);

        return {
          ...hospital.toObject(),
          availableDoctors,
          waitingCount,
        };
      })
    );

    res.json({ success: true, hospitals: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHospitalDoctors = async (req, res) => {
  try {
    await ensureHospitalData();

    const { problem } = req.query;
    const filter = { hospital: req.params.id };

    if (req.user && req.user.role === "HOSPITAL" && req.user.hospitalId) {
      filter.hospital = req.user.hospitalId;
    }

    if (problem && problem !== "Other") {
      filter.problems = problem;
    }

    const doctors = await Doctor.find(filter).populate("hospital");

    const results = await Promise.all(
      doctors.map(async (doctor) => {
        const waitingCount = await Token.countDocuments({
          tokenType: "hospital",
          hospital: doctor.hospital._id,
          doctor: doctor._id,
          status: "waiting",
        });

        return {
          ...doctor.toObject(),
          peopleWaiting: waitingCount || doctor.currentPatients,
          estimatedWaitingTime:
            (waitingCount || doctor.currentPatients) *
            doctor.averageConsultationTime,
        };
      })
    );

    res.json({ success: true, doctors: results, diseases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDoctorAttendance = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { action, reason = "" } = req.body;
    const hospitalId = req.params.id || req.body.hospitalId || req.user?.hospitalId;

    if (!hospitalId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: "Hospital and doctor are required",
      });
    }

    if (req.user && req.user.role === "HOSPITAL" && String(req.user.hospitalId) !== String(hospitalId)) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your hospital staff",
      });
    }

    const doctor = await Doctor.findOne({ _id: doctorId, hospital: hospitalId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found for this hospital",
      });
    }

    const normalizedAction = String(action || "checkin").toLowerCase();

    if (normalizedAction === "checkin") {
      doctor.attendanceStatus = "Present";
      doctor.isOnBreak = false;
      doctor.breakReason = "";
      doctor.lastCheckInAt = new Date();
    } else if (normalizedAction === "checkout") {
      doctor.attendanceStatus = "Absent";
      doctor.isOnBreak = false;
      doctor.breakReason = "";
      doctor.lastCheckInAt = null;
    } else if (normalizedAction === "break-start") {
      doctor.attendanceStatus = "On Break";
      doctor.isOnBreak = true;
      doctor.breakReason = reason || "Break";
      doctor.lastBreakStartedAt = new Date();
    } else if (normalizedAction === "break-end") {
      doctor.attendanceStatus = "Present";
      doctor.isOnBreak = false;
      doctor.breakReason = "";
      doctor.lastBreakEndedAt = new Date();
    } else if (normalizedAction === "working-hours") {
      const { start, end } = req.body;
      if (start) doctor.workingHoursStart = start;
      if (end) doctor.workingHoursEnd = end;
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported attendance action",
      });
    }

    await doctor.save();

    res.json({
      success: true,
      message: "Doctor attendance updated",
      doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createHospitalToken = async (req, res) => {
  try {
    const {
      patientName,
      doctorId,
      problem,
      phone,
      source = "online",
    } = req.body;

    let hospitalId = req.body.hospitalId;

    if (req.user && req.user.role === "HOSPITAL") {
      hospitalId = req.user.hospitalId;
    }

    if (!patientName || !hospitalId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: "Patient, hospital and doctor are required",
      });
    }

    const doctor = await Doctor.findById(doctorId).populate("hospital");

    if (!doctor || String(doctor.hospital._id) !== String(hospitalId)) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found for this hospital",
      });
    }

    if (!doctor.available) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not available",
      });
    }

    const tokenCount = await Token.countDocuments({
      tokenType: "hospital",
      hospital: hospitalId,
      doctor: doctorId,
    });

    const waitingCount = await Token.countDocuments({
      tokenType: "hospital",
      hospital: hospitalId,
      doctor: doctorId,
      status: "waiting",
    });

    const token = await Token.create({
      tokenType: "hospital",
      source,
      tokenNumber: `H-${String(tokenCount + 1).padStart(3, "0")}`,
      citizenName: patientName,
      phone,
      hospital: hospitalId,
      doctor: doctorId,
      status: "waiting",
      counter: null,
      expectedTime: addMinutes(
        waitingCount * doctor.averageConsultationTime
      ),
      problem,
    });

    const populatedToken = await Token.findById(token._id)
      .populate("hospital")
      .populate("doctor");

    res.status(201).json({
      success: true,
      message: "Hospital appointment booked",
      token: populatedToken,
      peopleAhead: waitingCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHospitalQueueStatus = async (req, res) => {
  try {
    const { doctorId } = req.query;
    let hospitalId = req.query.hospitalId;

    if (req.user && req.user.role === "HOSPITAL") {
      hospitalId = req.user.hospitalId;
    }

    if (!hospitalId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: "Hospital and doctor are required",
      });
    }

    const queue = await Token.find({
      tokenType: "hospital",
      hospital: hospitalId,
      doctor: doctorId,
      status: { $in: ["waiting", "serving"] },
    })
      .populate("hospital")
      .populate("doctor")
      .sort({ createdAt: 1 });

    const currentToken =
      queue.find((token) => token.status === "serving") || null;

    res.json({
      success: true,
      currentToken,
      peopleWaiting: queue.filter((token) => token.status === "waiting")
        .length,
      queue,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const callNextHospitalToken = async (req, res) => {
  try {
    const { doctorId, counter } = req.body;
    let hospitalId = req.body.hospitalId;
    const officerCounter = Number(counter);

    if (req.user && req.user.role === "HOSPITAL") {
      hospitalId = req.user.hospitalId;
    }

    if (!hospitalId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: "Hospital and doctor are required",
      });
    }

    if (![1, 2, 3].includes(officerCounter)) {
      return res.status(400).json({
        success: false,
        message: "Counter must be 1, 2, or 3",
      });
    }

    const currentServing = await Token.findOne({
      tokenType: "hospital",
      hospital: hospitalId,
      doctor: doctorId,
      status: "serving",
    });

    if (currentServing) {
      return res.status(400).json({
        success: false,
        message: "Complete or skip the current patient first.",
        token: currentServing,
      });
    }

    const nextToken = await Token.findOne({
      tokenType: "hospital",
      hospital: hospitalId,
      doctor: doctorId,
      status: "waiting",
    }).sort({ createdAt: 1 });

    if (!nextToken) {
      return res.json({
        success: true,
        message: "No patients waiting",
        token: null,
      });
    }

    nextToken.status = "serving";
    nextToken.counter = officerCounter;

    await nextToken.save();

    const populatedToken = await Token.findById(nextToken._id)
      .populate("hospital")
      .populate("doctor");

    res.json({
      success: true,
      message: "Next patient called",
      token: populatedToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const completeHospitalToken = async (req, res) => {
  try {
    let hospitalId = req.body.hospitalId;
    const { doctorId } = req.body;

    if (req.user && req.user.role === "HOSPITAL") {
      hospitalId = req.user.hospitalId;
    }

    const token = await Token.findOne({
      tokenType: "hospital",
      hospital: hospitalId,
      doctor: doctorId,
      status: "serving",
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "No patient is currently being served",
      });
    }

    token.status = "completed";
    token.servedAt = new Date();

    await token.save();

    res.json({
      success: true,
      message: "Patient completed",
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const skipHospitalToken = async (req, res) => {
  try {
    let hospitalId = req.body.hospitalId;
    const { doctorId } = req.body;

    if (req.user && req.user.role === "HOSPITAL") {
      hospitalId = req.user.hospitalId;
    }

    const token = await Token.findOne({
      tokenType: "hospital",
      hospital: hospitalId,
      doctor: doctorId,
      status: "serving",
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "No active patient token",
      });
    }

    token.status = "skipped";

    await token.save();

    res.json({
      success: true,
      message: "Patient skipped",
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getHospitals,
  getHospitalDoctors,
  updateDoctorAttendance,
  createHospitalToken,
  getHospitalQueueStatus,
  callNextHospitalToken,
  completeHospitalToken,
  skipHospitalToken,
  diseases,
};
