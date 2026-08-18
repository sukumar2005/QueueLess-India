const Notification = require("../models/Notification");

const createNotificationRecord = async ({
  tokenId = null,
  title,
  message,
  type = "queue_update",
  serviceId = null,
  hospitalId = null,
  governmentOfficeId = null,
}) => {
  if (!title || !message) {
    return null;
  }

  const notification = await Notification.create({
    title,
    message,
    type,
    token: tokenId,
    service: serviceId,
    hospital: hospitalId,
    governmentOffice: governmentOfficeId,
  });

  return notification;
};

const getNotifications = async (req, res) => {
  try {
    const { tokenId, type } = req.query;

    const filter = {};

    if (tokenId) filter.token = tokenId;
    if (type) filter.type = type;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Notification fetch error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Notification update error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createNotificationRecord,
  getNotifications,
  markNotificationRead,
};
