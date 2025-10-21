import { getAllCategoriesModel } from "../../models/category.model.js";

// 🟢 Lấy danh mục cho POS
export const getAllCategories = async (req, res) => {
  try {
    const { type } = req.query; // ?type=drinks hoặc ?type=foods
    const categories = await getAllCategoriesModel(type);
    res.json(categories);
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh mục" });
  }
};
