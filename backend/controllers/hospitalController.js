const mongoose = require("mongoose");
const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const Token = require("../models/Token");

// ======================================================
// DISEASES / PROBLEMS
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
// TIME HELPER
// ======================================================

const addMinutes = (minutes) => {
  const date = new Date(Date.now() + minutes * 60000);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ======================================================
// CREATE HOSPITAL DATA IF NEEDED
// ======================================================

const ensureHospitalData = async () => {
  let hospitals = await Hospital.find().sort({ name: 1 });

  // ----------------------------------------------------
  // CREATE HOSPITALS ONLY IF NONE EXIST
  // ----------------------------------------------------

  if (hospitals.length === 0) {
    hospitals = await Hospital.insertMany([
      {
        name: "Coimbatore Government Hospital",
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
  }

  // ----------------------------------------------------
  // MAKE SURE DOCTORS EXIST FOR EACH HOSPITAL
  // ----------------------------------------------------

  for (const hospital of hospitals) {
    const doctorCount = await Doctor.countDocuments({
      hospital: hospital._id,
    });

    // Doctors already exist for this hospital
    // so do not create duplicates.
    if (doctorCount > 0) {
      continue;
    }

    // ==================================================
    // COIMBATORE GOVERNMENT HOSPITAL
    // ==================================================

    if (
      hospital.name
        .toLowerCase()
        .includes("coimbatore government")
    ) {
      await Doctor.insertMany([
        {
          name: "Dr. Arun Kumar",
          specialization: "General Medicine",
          hospital: hospital._id,
          room: "204",
          available: true,
          currentPatients: 3,
          averageConsultationTime: 15,
          problems: [
            "Fever",
            "Cold",
            "Cough",
            "Headache",
            "General Checkup",
          ],
        },

        {
          name: "Dr. Meena Devi",
          specialization: "Dermatology",
          hospital: hospital._id,
          room: "112",
          available: true,
          currentPatients: 2,
          averageConsultationTime: 20,
          problems: [
            "Skin Problem",
            "Other",
          ],
        },

        {
          name: "Dr. Karthik Raj",
          specialization: "General Medicine",
          hospital: hospital._id,
          room: "108",
          available: true,
          currentPatients: 4,
          averageConsultationTime: 15,
          problems: [
            "Fever",
            "Cold",
            "Cough",
            "Stomach Pain",
            "General Checkup",
          ],
        },

        {
          name: "Dr. Priya",
          specialization: "Endocrinology",
          hospital: hospital._id,
          room: "305",
          available: true,
          currentPatients: 1,
          averageConsultationTime: 20,
          problems: [
            "Diabetes",
            "Blood Pressure",
          ],
        },

        {
          name: "Dr. Suresh",
          specialization: "Emergency Medicine",
          hospital: hospital._id,
          room: "101",
          available: true,
          currentPatients: 2,
          averageConsultationTime: 12,
          problems: [
            "Chest Pain",
            "Injury",
            "Headache",
          ],
        },
      ]);

      continue;
    }

    // ==================================================
    // DISTRICT HOSPITAL
    // ==================================================

    if (
      hospital.name
        .toLowerCase()
        .includes("district hospital")
    ) {
      await Doctor.insertMany([
        {
          name: "Dr. Kiran",
          specialization: "Emergency Medicine",
          hospital: hospital._id,
          room: "101",
          available: true,
          currentPatients: 3,
          averageConsultationTime: 12,
          problems: [
            "Chest Pain",
            "Injury",
            "Stomach Pain",
          ],
        },

        {
          name: "Dr. Anitha",
          specialization: "General Medicine",
          hospital: hospital._id,
          room: "202",
          available: true,
          currentPatients: 2,
          averageConsultationTime: 15,
          problems: [
            "Fever",
            "Cold",
            "Cough",
            "General Checkup",
          ],
        },

        {
          name: "Dr. Rahul",
          specialization: "Dermatology",
          hospital: hospital._id,
          room: "105",
          available: true,
          currentPatients: 1,
          averageConsultationTime: 20,
          problems: [
            "Skin Problem",
            "Other",
          ],
        },
      ]);

      continue;
    }

    // ==================================================
    // POLLACHI HOSPITAL
    // ==================================================

    if (
      hospital.name
        .toLowerCase()
        .includes("pollachi")
    ) {
      await Doctor.insertMany([
        {
          name: "Dr. Lakshmi",
          specialization: "General Medicine",
          hospital: hospital._id,
          room: "18",
          available: true,
          currentPatients: 2,
          averageConsultationTime: 15,
          problems: [
            "Diabetes",
            "Blood Pressure",
            "Headache",
            "General Checkup",
          ],
        },

        {
          name: "Dr. Naveen",
          specialization: "General Medicine",
          hospital: hospital._id,
          room: "20",
          available: true,
          currentPatients: 2,
          averageConsultationTime: 15,
          problems: [
            "Fever",
            "Cold",
            "Cough",
          ],
        },
      ]);

      continue;
    }

    // ==================================================
    // VIJAYAWADA HOSPITAL
    // ==================================================

    if (
      hospital.name
        .toLowerCase()
        .includes("vijayawada")
    ) {
      await Doctor.insertMany([
        {
          name: "Dr. Prasad",
          specialization: "General Medicine",
          hospital: hospital._id,
          room: "32",
          available: true,
          currentPatients: 4,
          averageConsultationTime: 15,
          problems: [
            "Fever",
            "Cold",
            "Cough",
            "General Checkup",
          ],
        },

        {
          name: "Dr. Swetha",
          specialization: "Dermatology",
          hospital: hospital._id,
          room: "45",
          available: true,
          currentPatients: 1,
          averageConsultationTime: 20,
          problems: [
            "Skin Problem",
            "Other",
          ],
        },
      ]);

      continue;
    }

    // ==================================================
    // FALLBACK FOR ANY OTHER EXISTING HOSPITAL
    // ==================================================

    await Doctor.insertMany([
      {
        name: "Dr. General Physician",
        specialization: "General Medicine",
        hospital: hospital._id,
        room: "101",
        available: true,
        currentPatients: 2,
        averageConsultationTime: 15,
        problems: [
          "Fever",
          "Cold",
          "Cough",
          "Headache",
          "General Checkup",
        ],
      },

      {
        name: "Dr. Specialist",
        specialization: "General Medicine",
        hospital: hospital._id,
        room: "102",
        available: true,
        currentPatients: 1,
        averageConsultationTime: 15,
        problems: [
          "Diabetes",
          "Blood Pressure",
          "Stomach Pain",
        ],
      },
    ]);
  }
};

// ======================================================
// GET ALL HOSPITALS
// ======================================================

const getHospitals = async (req, res) => {
  try {
    await ensureHospitalData();

    const {
      state,
      district,
      village,
    } = req.query;

    const filter = {};

    // Hospital staff can only see their hospital
    if (
      req.user &&
      req.user.role === "HOSPITAL" &&
      req.user.hospitalId
    ) {
      filter._id = req.user.hospitalId;
    }

    if (state) {
      filter.state = state;
    }

    if (district) {
      filter.district = district;
    }

    if (village) {
      filter.village = village;
    }

    const hospitals = await Hospital.find(filter)
      .sort({ name: 1 });

    const results = await Promise.all(
      hospitals.map(async (hospital) => {
        const [
          availableDoctors,
          waitingCount,
        ] = await Promise.all([
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

    return res.json({
      success: true,
      hospitals: results,
    });

  } catch (error) {
    console.error(
      "Get hospitals error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET DOCTORS FOR HOSPITAL
// ======================================================

const getHospitalDoctors = async (req, res) => {
  try {
    // IMPORTANT:
    // This now creates doctors even when hospitals
    // already existed in MongoDB.
    await ensureHospitalData();

    const { problem } = req.query;

    let hospitalId = req.params.id;

    // Hospital staff can only access their own hospital
    if (
      req.user &&
      req.user.role === "HOSPITAL" &&
      req.user.hospitalId
    ) {
      hospitalId = req.user.hospitalId;
    }

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required",
      });
    }

    // --------------------------------------------------
    // CHECK HOSPITAL
    // --------------------------------------------------

    const hospital = await Hospital.findById(
      hospitalId
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // --------------------------------------------------
    // DOCTOR FILTER
    // --------------------------------------------------

    const filter = {
      hospital: hospitalId,
    };

    // Only filter by problem when a real problem
    // is selected.
    if (
      problem &&
      problem !== "Other"
    ) {
      filter.problems = problem;
    }

    // --------------------------------------------------
    // FIND DOCTORS
    // --------------------------------------------------

    const doctors = await Doctor.find(filter)
      .populate("hospital")
      .sort({ name: 1 });

    // --------------------------------------------------
    // WAITING INFORMATION
    // --------------------------------------------------

    const results = await Promise.all(
      doctors.map(async (doctor) => {

        const waitingCount =
          await Token.countDocuments({
            tokenType: "hospital",
            hospital:
              doctor.hospital?._id ||
              hospitalId,
            doctor: doctor._id,
            status: "waiting",
          });

        const currentPatients =
          Number(
            doctor.currentPatients
          ) || 0;

        const averageConsultationTime =
          Number(
            doctor.averageConsultationTime
          ) || 15;

        const peopleWaiting =
          waitingCount > 0
            ? waitingCount
            : currentPatients;

        const estimatedWaitingTime =
          peopleWaiting *
          averageConsultationTime;

        return {
          ...doctor.toObject(),

          peopleWaiting,

          estimatedWaitingTime,

          averageConsultationTime,
        };
      })
    );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.json({
      success: true,

      doctors: results,

      diseases,

      count: results.length,

      hospital: {
        _id: hospital._id,
        name: hospital.name,
      },
    });

  } catch (error) {

    console.error(
      "Get hospital doctors error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ======================================================
// CREATE HOSPITAL TOKEN / BOOK APPOINTMENT
// ======================================================

const createHospitalToken = async (req, res) => {
  try {
    const {
      patientName,
      hospitalId,
      doctorId,
      problem,
      source = "online",
    } = req.body;

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!patientName || !patientName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Patient name is required",
      });
    }

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital is required",
      });
    }

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor is required",
      });
    }

    if (!problem) {
      return res.status(400).json({
        success: false,
        message: "Problem is required",
      });
    }

    // ------------------------------------------
    // CHECK HOSPITAL
    // ------------------------------------------

    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // ------------------------------------------
    // CHECK DOCTOR
    // ------------------------------------------

    const doctor = await Doctor.findOne({
      _id: doctorId,
      hospital: hospitalId,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found for this hospital",
      });
    }

    // ------------------------------------------
    // CHECK DOCTOR AVAILABILITY
    // ------------------------------------------

    if (!doctor.available) {
      return res.status(400).json({
        success: false,
        message:
          `${doctor.name} is currently unavailable`,
      });
    }

    // ------------------------------------------
    // COUNT CURRENT WAITING TOKENS
    // ------------------------------------------

    const waitingCount =
      await Token.countDocuments({
        tokenType: "hospital",
        hospital: hospitalId,
        doctor: doctorId,
        status: "waiting",
      });

    // ------------------------------------------
    // GENERATE TOKEN NUMBER
    // ------------------------------------------

    const tokenNumber =
      `H-${String(waitingCount + 1).padStart(3, "0")}`;

    // ------------------------------------------
    // CALCULATE EXPECTED TIME
    // ------------------------------------------

    const consultationTime =
      Number(
        doctor.averageConsultationTime
      ) || 15;

    const estimatedMinutes =
      waitingCount * consultationTime;

    const expectedTime =
      addMinutes(estimatedMinutes);

    // ------------------------------------------
    // CREATE TOKEN
    // ------------------------------------------

    const token = await Token.create({
      tokenNumber,

      tokenType: "hospital",

      source,

      hospital: hospitalId,

      doctor: doctorId,

      problem,

      expectedTime,

      citizenName:
        patientName.trim(),

      status: "waiting",
    });

    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Appointment booked successfully",

      token: {
        _id: token._id,

        tokenNumber:
          token.tokenNumber,

        patientName:
          token.citizenName,

        problem:
          token.problem,

        status:
          token.status,

        expectedTime:
          token.expectedTime,

        peopleWaiting:
          waitingCount,

        estimatedWaitingTime:
          estimatedMinutes,

        hospital: {
          _id: hospital._id,
          name: hospital.name,
        },

        doctor: {
          _id: doctor._id,
          name: doctor.name,
          specialization:
            doctor.specialization,
          room: doctor.room,
        },
      },
    });

  } catch (error) {
    console.error(
      "Create hospital token error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getHospitals,
  getHospitalDoctors,
  createHospitalToken,
};