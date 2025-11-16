// app.js
import express from "express";
import path from "path";
import userRoutes from "./routes/user-api";
import authRoutes from "./routes/auth-api";
import locationRoutes from "./routes/location-api";
import homeRoutes from "./routes/home-api";
import shopRoutes from "./routes/shop-api";
import productRoutes from "./routes/product-api";
import cartRoutes from "./routes/cart-api";
import dbTestRoutes from "./routes/db-test-api";
const app = express();

// Middleware
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));


app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", locationRoutes);
app.use("/api", homeRoutes);
app.use("/api", shopRoutes);
app.use("/api",productRoutes);
app.use("/api",cartRoutes);
app.use("/api", dbTestRoutes);
export default app;
