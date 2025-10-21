// models/customer.model.js
import { db } from "../config/db.js";


// 🔍 Lấy khách hàng theo số điện thoại
export const getCustomerByPhoneModel = async (phone) => {
  const [rows] = await db.query('SELECT * FROM customers WHERE phone = ?', [phone]);
  return rows;
};

// ➕ Tạo mới khách hàng
export const createCustomerModel = async (phone, name) => {
  const [result] = await db.query(
    'INSERT INTO customers (phone, name) VALUES (?, ?)',
    [phone, name]
  );
  return result.insertId;
};
