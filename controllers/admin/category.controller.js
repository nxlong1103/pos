import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import * as XLSX from "xlsx";
import { db } from "../../config/db.js";
import { getAdminCategoriesModel } from "../../models/category.model.js";

// Khai báo đường dẫn tuyệt đối
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🟢 Lấy danh sách danh mục + thống kê doanh thu
export const getCategories = async (req, res) => {
  try {
    const rows = await getAdminCategoriesModel();
    res.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh mục" });
  }
};

// 🟢 Lọc nâng cao
export const filterCategories = async (req, res) => {
  try {
    const { name = "", type = "", hasProducts = "" } = req.query;
    let query = `
      SELECT 
        c.id, c.name, c.type, COUNT(p.id) AS product_count,
        COALESCE(SUM(oi.price * oi.quantity), 0) AS total_revenue
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      WHERE c.name LIKE ?`;

    const params = [`%${name}%`];
    if (type) {
      query += " AND c.type = ?";
      params.push(type);
    }
    query += " GROUP BY c.id HAVING 1=1";
    if (hasProducts === "empty") query += " AND product_count = 0";
    if (hasProducts === "nonempty") query += " AND product_count > 0";
    query += " ORDER BY c.id DESC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi lọc danh mục:", error);
    res.status(500).json({ message: "Lỗi khi lọc danh mục" });
  }
};

// 🟢 Xuất Excel
export const exportCategoriesToExcel = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id AS ID,
        c.name AS 'Tên danh mục',
        c.type AS 'Loại',
        COUNT(p.id) AS 'Số sản phẩm',
        COALESCE(SUM(oi.price * oi.quantity), 0) AS 'Doanh thu (VNĐ)'
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      GROUP BY c.id
      ORDER BY c.id DESC
    `);

    const exportDir = path.join(__dirname, "../../exports");
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh mục");
    const filePath = path.join(exportDir, "categories.xlsx");
    XLSX.writeFile(workbook, filePath);
    res.download(filePath);
  } catch (error) {
    console.error("❌ Lỗi khi xuất Excel:", error);
    res.status(500).json({ message: "Lỗi khi xuất Excel" });
  }
};

// 🟢 CRUD danh mục
export const getProductsByCategory = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM products WHERE category_id = ?",
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi lấy sản phẩm theo danh mục" });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    await db.query("INSERT INTO categories (name, type) VALUES (?, ?)", [
      name,
      type,
    ]);
    res.json({ message: "Thêm danh mục thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thêm danh mục" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    await db.query("UPDATE categories SET name=?, type=? WHERE id=?", [
      name,
      type,
      req.params.id,
    ]);
    res.json({ message: "Cập nhật danh mục thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi cập nhật danh mục" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const [check] = await db.query(
      "SELECT COUNT(*) AS count FROM products WHERE category_id=?",
      [categoryId]
    );

    if (check[0].count > 0)
      return res
        .status(400)
        .json({ message: "Không thể xóa vì danh mục vẫn còn sản phẩm." });

    await db.query("DELETE FROM categories WHERE id=?", [categoryId]);
    res.json({ message: "Xóa danh mục thành công." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi xóa danh mục." });
  }
};
