// backend/models/category.model.js
import { db } from "../config/db.js";

// 🟢 Lấy tất cả danh mục (có thể filter theo type)
export const getAllCategoriesModel = async (type = null) => {
  let query = "SELECT * FROM categories";
  const params = [];

  if (type) {
    query += " WHERE type = ?";
    params.push(type);
  }

  const [rows] = await db.query(query, params);
  return rows;
};

// 🟢 Lấy danh mục + thống kê doanh thu (cho admin)
export const getAdminCategoriesModel = async () => {
  const [rows] = await db.query(`
    SELECT 
      c.id, 
      c.name, 
      c.type, 
      COUNT(p.id) AS product_count,
      COALESCE(SUM(oi.price * oi.quantity), 0) AS total_revenue
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    LEFT JOIN order_items oi ON oi.product_id = p.id
    GROUP BY c.id
    ORDER BY c.id DESC
  `);
  return rows;
};
