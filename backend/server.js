const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");

const connectDB = require("./config/db");

const queueRoutes = require("./routes/queueRoutes");
const serviceRoutes = require("./routes/serviceRoutes");

dotenv.config();

const app = express();

const server = http.createServer(app);

app.use(cors());

app.use(express.json());

app.use("/api/queue", queueRoutes);

app.use("/api/services", serviceRoutes);

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

    server.listen(PORT, () => {
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