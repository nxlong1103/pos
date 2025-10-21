import { db } from "../config/db.js";


import { updateOrderTotal } from "./orderItem.model.js";

// 🔹 Lấy danh sách combo + các món trong combo
export const getAllCombosModel = async () => {
  const [combos] = await db.query("SELECT * FROM combos");

  for (const combo of combos) {
    const [items] = await db.query(
      `SELECT ci.quantity, p.id AS product_id, p.name, p.price, p.image
       FROM combo_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.combo_id = ?`,
      [combo.id]
    );
    combo.items = items;
  }

  return combos;
};

// 🔹 Thêm combo vào order_items (chỉ 1 dòng, không thêm món con)
export const addComboToOrderModel = async (orderId, comboId, note = null, quantity = 1) => {
  // 1️⃣ Lấy thông tin combo
  const [[comboInfo]] = await db.query(
    "SELECT id, name, price, description FROM combos WHERE id = ?",
    [comboId]
  );
  if (!comboInfo) throw new Error("Không tìm thấy combo");

  // 2️⃣ Lấy danh sách món con trong combo (chỉ để trả về — không ghi DB)
  const [comboProducts] = await db.query(
    `SELECT p.id AS product_id, p.name, p.price, ci.quantity
     FROM combo_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.combo_id = ?`,
    [comboId]
  );

  // 3️⃣ Ghi combo cha vào order_items
  const [comboResult] = await db.query(
    `INSERT INTO order_items (order_id, combo_id, quantity, price, note)
     VALUES (?, ?, ?, ?, ?)`,
    [
      orderId,
      comboId,
      quantity,
      comboInfo.price,
      note && note.trim() !== '' ? note : null, // ✅ chỉ ghi khi có note
    ]
  );

  // 4️⃣ Cập nhật tổng tiền đơn
  await updateOrderTotal(orderId);

  // 5️⃣ Trả kết quả cho controller
  return {
    comboItemId: comboResult.insertId,
    comboName: comboInfo.name,
    comboProducts, // ✅ vẫn gửi về cho FE hiển thị chi tiết
  };
};
