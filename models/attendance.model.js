import { db } from "../config/db.js";


// 🔍 Tìm nhân viên theo mã QR
export const findUserByQr = async (qr_code) => {
  const [rows] = await db.query(
    "SELECT id, name FROM users WHERE qr_code = ?",
    [qr_code]
  );
  return rows[0] || null;
};

// 🔍 Lấy bản ghi chấm công gần nhất của nhân viên
export const findLastAttendance = async (user_id) => {
  const [rows] = await db.query(
    "SELECT * FROM attendance WHERE user_id = ? ORDER BY id DESC LIMIT 1",
    [user_id]
  );
  return rows[0] || null;
};

// ➕ Thêm bản ghi check-in
export const insertCheckIn = async (user_id) => {
  const [result] = await db.query(
    `INSERT INTO attendance (user_id, check_in, status)
     VALUES (?, NOW(), 'IN')`,
    [user_id]
  );
  return result.insertId;
};

// 🔁 Cập nhật check-out & tính giờ làm dạng HH:MM
export const updateCheckOut = async (user_id, check_in_id) => {
  const [result] = await db.query(
    `UPDATE attendance
     SET check_out = NOW(),
         work_hour = ROUND(TIMESTAMPDIFF(MINUTE, check_in, NOW()) / 60, 2),
         status = 'OUT'
     WHERE id = ? AND user_id = ?`,
    [check_in_id, user_id]
  );
  return result.affectedRows > 0;
};
