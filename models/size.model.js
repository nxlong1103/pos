// backend/models/size.model.js
import { db } from "../config/db.js";

// ======================= SIZE MODEL =======================

// 🔹 Lấy tất cả size
export const getAllSizesModel = async () => {
  const [rows] = await db.query("SELECT * FROM sizes ORDER BY id ASC");
  return rows;
};

// 🔹 Thêm size mới
export const addSizeModel = async (name, price_modifier) => {
  await db.query("INSERT INTO sizes (name, price_modifier) VALUES (?, ?)", [
    name,
    price_modifier,
  ]);
};

// 🔹 Cập nhật size
export const updateSizeModel = async (id, name, price_modifier) => {
  await db.query(
    "UPDATE sizes SET name=?, price_modifier=? WHERE id=?",
    [name, price_modifier, id]
  );
};

// 🔹 Xóa size
export const deleteSizeModel = async (id) => {
  await db.query("DELETE FROM sizes WHERE id=?", [id]);
};
