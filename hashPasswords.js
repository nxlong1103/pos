import bcrypt from "bcryptjs";
import { db } from "./config/db.js";

const hashAll = async () => {
  const [users] = await db.query("SELECT id, password FROM users");
  for (const u of users) {
    if (!u.password.startsWith("$2a$")) {
      const hashed = await bcrypt.hash(u.password, 10);
      await db.query("UPDATE users SET password=? WHERE id=?", [hashed, u.id]);
      console.log(`✅ Đã mã hóa mật khẩu cho user ID ${u.id}`);
    }
  }
  process.exit();
};

hashAll();
