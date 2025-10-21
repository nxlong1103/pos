// backend/controllers/admin/TopProducts.controller.js
import { getTopProducts } from "../../models/dashboard.model.js";

export const getTopProductsController = async (req, res) => {
  try {
    const range = req.query.range || "today";
    const type = req.query.type || "quantity";
    const rows = await getTopProducts(range, type);
    res.json({ range, type, data: rows });
  } catch (error) {
    console.error("❌ Lỗi getTopProducts:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
};
