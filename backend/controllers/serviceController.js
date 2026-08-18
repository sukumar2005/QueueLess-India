const Service = require("../models/Service");
const {
  documentCenterData,
  defaultApplicationSteps,
  defaultGuidance,
} = require("../data/documentCenterData");

const ensureDocumentCenterData = async () => {
  await Promise.all(
    documentCenterData.map((item) =>
      Service.findOneAndUpdate(
        { name: item.name },
        {
          $set: {
            ...item,
            available: true,
            applicationSteps: defaultApplicationSteps,
            guidance: defaultGuidance,
            stateInfo: {
              "Tamil Nadu": {
                department: item.department,
                office: item.office,
              },
              "Andhra Pradesh": {
                department: item.department,
                office: item.office,
              },
            },
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      )
    )
  );
};

const getServices = async (req, res) => {
  try {
    const services = await Service.find({
      available: true,
    }).sort({
      name: 1,
    });

    res.json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDocumentServices = async (req, res) => {
  try {
    await ensureDocumentCenterData();

    const { search, category } = req.query;

    const filter = {
      available: true,
    };

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { office: { $regex: search, $options: "i" } },
        { documents: { $regex: search, $options: "i" } },
      ];
    }

    const services = await Service.find(filter).sort({
      name: 1,
    });

    const categories = await Service.distinct("category", {
      available: true,
    });

    res.json({
      success: true,
      count: services.length,
      categories: ["All", ...categories.filter(Boolean).sort()],
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getServices,
  getServiceById,
  getDocumentServices,
};
