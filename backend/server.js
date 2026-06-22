require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const createDefaultConfig = require("./utils/createDefaultConfig");

const garmentRoutes = require("./routes/garmentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const configRoutes = require("./routes/configRoutes");

const app = express();
const PORT = process.env.PORT;

const adminAuthRoutes = require("./routes/adminAuthRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");
const promoRoutes = require("./routes/promoRoutes");
const aiRoutes = require("./routes/aiRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

connectDB();
createDefaultConfig();

app.use(cors());
app.use(express.json());

app.use("/api/admin/auth", adminAuthRoutes);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use("/api/garments", garmentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/config", configRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/promos", promoRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});