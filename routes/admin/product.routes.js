// backend/routes/admin/product.routes.js
import express from "express";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getSizes,
  addSize,
  updateSize,
  deleteSize,
  exportProductsToExcel,
  upload,
} from "../../controllers/admin/product.controller.js";

const router = express.Router();

// ====== CRUD SẢN PHẨM ======
router.get("/", getProducts);
router.post("/", upload.single("image"), addProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

// ====== QUẢN LÝ SIZE (trong trang quản lý sản phẩm) ======
router.get("/sizes", getSizes);
router.post("/sizes", addSize);
router.put("/sizes/:id", updateSize);
router.delete("/sizes/:id", deleteSize);

// ====== EXPORT EXCEL ======
router.get("/export/excel", exportProductsToExcel);

export default router;
