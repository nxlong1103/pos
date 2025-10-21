import express from "express";
import { scanQr, checkUserByQr } from "../../controllers/pos/attendance.controller.js";

const router = express.Router();

// 🔹 Kiểm tra nhân viên và trạng thái
router.post("/check-user", checkUserByQr);

// 🔹 Thực hiện check-in / check-out
router.post("/scan", scanQr);

export default router;
