// backend/config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "coffee",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4_general_ci",
});

// ✅ Kiểm tra kết nối MySQL khi khởi động server
try {
  const connection = await db.getConnection();
  console.log("✅ MySQL connected successfully!");
  connection.release();
} catch (err) {
  console.error("❌ MySQL connection failed:", err.message);
}
