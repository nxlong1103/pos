import { getAllProductsModel } from '../../models/product.model.js';



export const getAllProducts = async (req, res) => {
  try {
    const { category_id } = req.query;
    const products = await getAllProductsModel(category_id);
    res.json(products);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm" });
  }
};
