require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");

const connectDB = require("./config/db");

const queueRoutes = require("./routes/queueRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const governmentOfficeRoutes = require("./routes/governmentOfficeRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const { seedAdmin, createDemoAccounts } = require("./controllers/authController");

const app = express();

const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/government-offices", governmentOfficeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "QueueLess India API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "QueueLess India Backend",
    status: "healthy",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await createDemoAccounts();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(
        `QueueLess India server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Server startup failed:");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
