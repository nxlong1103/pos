import express from "express";
import {
  getCategories,
  getProductsByCategory,
  addCategory,
  updateCategory,
  deleteCategory,
  filterCategories,
  exportCategoriesToExcel,
} from "../../controllers/admin/category.controller.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/filter/search", filterCategories);
router.get("/export/excel", exportCategoriesToExcel);
router.get("/:id/products", getProductsByCategory);
router.post("/", addCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
