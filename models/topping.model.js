// models/topping.model.js
import { db } from "../config/db.js";


// 🍧 Lấy danh sách tất cả topping
export const getAllToppingsModel = async () => {
  const [rows] = await db.query('SELECT * FROM toppings');
  return rows;
};
