import dayjs from "dayjs";
import bcrypt from "bcryptjs";
import {
  findUserById,
  updateUserById,
  getPasswordById,
  updatePasswordById,
} from "../../models/user.model.js";

// 🧍‍♂️ Lấy profile
export const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    if (user.birthday) user.birthday = dayjs(user.birthday).format("YYYY-MM-DD");
    res.json(user);
  } catch (error) {
    console.error("Lỗi getProfile:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// 🧾 Cập nhật profile
export const updateProfile = async (req, res) => {
  try {
    await updateUserById(req.params.id, req.body);
    res.json({ message: "✅ Cập nhật thông tin thành công" });
  } catch (error) {
    console.error("Lỗi updateProfile:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// 🔐 Đổi mật khẩu
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword)
    return res.status(400).json({ message: "Thiếu dữ liệu yêu cầu" });

  if (newPassword !== confirmPassword)
    return res.status(400).json({ message: "Mật khẩu mới không khớp" });

  try {
    const user = await getPasswordById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await updatePasswordById(req.params.id, hashed);

    res.json({ message: "✅ Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi changePassword:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
