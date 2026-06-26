require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const createDefaultConfig = require("./utils/createDefaultConfig");

const garmentRoutes = require("./routes/garmentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const configRoutes = require("./routes/configRoutes");

const adminAuthRoutes = require("./routes/adminAuthRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");
const promoRoutes = require("./routes/promoRoutes");
const aiRoutes = require("./routes/aiRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173"
  ],
  credentials: true
}));

app.use(express.json());

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/garments", garmentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/config", configRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/promos", promoRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);

const startServer = async () => {
  await connectDB();
  await createDefaultConfig();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();