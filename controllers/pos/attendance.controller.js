import {
  findUserByQr,
  findLastAttendance,
  insertCheckIn,
  updateCheckOut,
} from "../../models/attendance.model.js";

// 🟢 API chính: Chấm công bằng QR (check-in / check-out)
export const scanQr = async (req, res) => {
  try {
    const { qr_code } = req.body;
    const user = await findUserByQr(qr_code);
    if (!user) return res.status(404).json({ message: "❌ Mã QR không hợp lệ!" });

    const last = await findLastAttendance(user.id);
    const now = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    if (!last || last.status === "OUT") {
      await insertCheckIn(user.id);
      return res.json({ message: `✅ ${user.name} đã CHECK-IN lúc ${now}` });
    } else {
      await updateCheckOut(user.id, last.id);
      return res.json({ message: `👋 ${user.name} đã CHECK-OUT lúc ${now}` });
    }
  } catch (err) {
    console.error("Lỗi scanQr:", err);
    res.status(500).json({ message: "⚠️ Lỗi server khi quét QR" });
  }
};

// 🟡 API phụ: Kiểm tra thông tin nhân viên theo QR
export const checkUserByQr = async (req, res) => {
  try {
    const { qr_code } = req.body;
    const user = await findUserByQr(qr_code);
    if (!user) return res.status(404).json({ message: "User not found" });

    const last = await findLastAttendance(user.id);
    const status = last?.status || "OUT";

    res.json({ name: user.name, status });
  } catch (err) {
    console.error("Lỗi checkUserByQr:", err);
    res.status(500).json({ message: "Server error" });
  }
};
