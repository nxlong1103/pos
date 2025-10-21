import express from "express";
import { getDashboardOverview } from "../../controllers/admin/dashboard.controller.js";
import { getTopProductsController } from "../../controllers/admin/TopProducts.controller.js";

const router = express.Router();

// ✅ Tổng quan Dashboard (doanh thu, khách hàng, biểu đồ)
router.get("/overview", getDashboardOverview);

// ✅ Top sản phẩm bán chạy (số lượng hoặc doanh thu)
router.get("/top-products", getTopProductsController);

export default router;
