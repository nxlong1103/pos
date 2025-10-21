// models/table.model.js
import { db } from "../config/db.js";


// 🪑 Lấy danh sách tất cả bàn
export const getAllTablesModel = async () => {
  const [rows] = await db.query('SELECT * FROM tables ORDER BY id ASC');
  return rows;
};
