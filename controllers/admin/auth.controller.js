import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { findUserByPhone } from "../../models/user.model.js";

dotenv.config();

// 🟢 Đăng nhập admin
export const loginAdmin = async (req, res) => {
  const { phone, password } = req.body;

  try {
    if (!phone || !password)
      return res.status(400).json({ message: "⚠️ Vui lòng nhập đầy đủ thông tin!" });

    // 🔍 Lấy user từ Model
    const user = await findUserByPhone(phone);
    if (!user)
      return res.status(401).json({ message: "❌ Tài khoản không tồn tại!" });

    // 🚫 Kiểm tra quyền
    if (user.role_id !== 1)
      return res.status(403).json({ message: "🚫 Không có quyền truy cập giao diện admin!" });

    // ✅ So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "❌ Sai mật khẩu!" });

    // ✅ Tạo JWT
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "✅ Đăng nhập thành công!",
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    console.error("🔥 Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
};
