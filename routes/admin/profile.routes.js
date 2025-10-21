import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../controllers/admin/profile.controller.js";

const router = express.Router();

// 🧍‍♂️ Lấy thông tin admin
router.get("/:id", getProfile);

// ✏️ Cập nhật thông tin
router.put("/:id", updateProfile);

// 🔐 Đổi mật khẩu
router.put("/change-password/:id", changePassword);

export default router;
