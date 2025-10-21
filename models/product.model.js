// backend/models/product.model.js
import { db } from "../config/db.js";

// ======================= PRODUCT MODEL =======================

// 🔹 Lấy danh sách sản phẩm (có thể lọc theo category)
export const getAllProductsModel = async (categoryId = null) => {
  let query = `
    SELECT 
      p.*, 
      c.name AS category_name, 
      c.type AS category_type
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `;
  const params = [];

  if (categoryId) {
    query += " WHERE p.category_id = ?";
    params.push(categoryId);
  }

  query += " ORDER BY p.id DESC";
  const [rows] = await db.query(query, params);
  return rows;
};

// 🔹 Lấy sản phẩm theo ID
export const getProductById = async (id) => {
  const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
  return rows[0];
};

// 🔹 Thêm sản phẩm
export const addProductModel = async (data) => {
  const { name, price, category_id, status, image } = data;
  await db.query(
    "INSERT INTO products (name, price, category_id, status, image) VALUES (?, ?, ?, ?, ?)",
    [name, price, category_id, status || "active", image]
  );
};

// 🔹 Cập nhật sản phẩm
export const updateProductModel = async (id, data) => {
  const { name, price, category_id, status, image } = data;
  if (image) {
    await db.query(
      "UPDATE products SET name=?, price=?, category_id=?, status=?, image=? WHERE id=?",
      [name, price, category_id, status, image, id]
    );
  } else {
    await db.query(
      "UPDATE products SET name=?, price=?, category_id=?, status=? WHERE id=?",
      [name, price, category_id, status, id]
    );
  }
};

// 🔹 Xóa sản phẩm
export const deleteProductModel = async (id) => {
  await db.query("DELETE FROM products WHERE id=?", [id]);
};
