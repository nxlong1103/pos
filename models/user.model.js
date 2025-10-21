import { db } from "../config/db.js";

// 🔍 Tìm user theo số điện thoại (đã có)
export const findUserByPhone = async (phone) => {
  const [rows] = await db.query("SELECT * FROM users WHERE phone = ?", [phone]);
  return rows[0];
};

// 🔍 Tìm user theo ID
export const findUserById = async (id) => {
  const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

// ✏️ Cập nhật thông tin user
export const updateUserById = async (id, data) => {
  const {
    name, email, phone, address, city, district, ward, birthday, notes
  } = data;
  await db.query(
    `UPDATE users SET name=?, email=?, phone=?, address=?, city=?, district=?, ward=?, birthday=?, notes=? WHERE id=?`,
    [name, email, phone, address, city, district, ward, birthday, notes, id]
  );
};

// 🔐 Lấy mật khẩu và cập nhật mật khẩu
export const getPasswordById = async (id) => {
  const [[row]] = await db.query("SELECT password FROM users WHERE id=?", [id]);
  return row;
};
export const updatePasswordById = async (id, hashed) => {
  await db.query("UPDATE users SET password=? WHERE id=?", [hashed, id]);
};
