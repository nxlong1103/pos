console.log("📂 Current working directory:", process.cwd());

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./config/db.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // phục vụ ảnh cho admin

// ========================= ADMIN ROUTES =========================
import adminAuthRoutes from "./routes/admin/auth.routes.js";
import adminCategoryRoutes from "./routes/admin/category.routes.js";
import adminDashboardRoutes from "./routes/admin/dashboard.routes.js";
import adminProfileRoutes from "./routes/admin/profile.routes.js";
import adminProductRoutes from "./routes/admin/product.routes.js";
// sau này thêm topping/combo admin => import tương tự

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/profile", adminProfileRoutes);
app.use("/api/admin/products", adminProductRoutes);

// ========================= POS ROUTES =========================
import posProductRoutes from "./routes/pos/product.route.js";
import posCategoryRoutes from "./routes/pos/category.route.js";
import posSizeRoutes from "./routes/pos/size.route.js";
import posTableRoutes from "./routes/pos/table.route.js";
import posOrderItemRoutes from "./routes/pos/orderItem.route.js";
import posOrderRoutes from "./routes/pos/order.route.js";
import posCustomerRoutes from "./routes/pos/customer.route.js";
import posToppingRoutes from "./routes/pos/topping.route.js";
import posComboRoutes from "./routes/pos/combo.route.js";
import posAttendanceRoutes from "./routes/pos/attendance.route.js";

app.use("/api/pos/products", posProductRoutes);
app.use("/api/pos/categories", posCategoryRoutes);
app.use("/api/pos/sizes", posSizeRoutes);
app.use("/api/pos/tables", posTableRoutes);
app.use("/api/pos/order-items", posOrderItemRoutes);
app.use("/api/pos/orders", posOrderRoutes);
app.use("/api/pos/customers", posCustomerRoutes);
app.use("/api/pos/toppings", posToppingRoutes);
app.use("/api/pos/combos", posComboRoutes);
app.use("/api/pos/attendance", posAttendanceRoutes);

// ========================= TEST =========================
app.get("/", (req, res) => res.send("✅ Coffee POS API is running..."));

// ========================= START SERVER =========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT} (Timezone: ${process.env.TZ || "Asia/Ho_Chi_Minh"})`);
});
