// models/orderItem.model.js
import { db } from "../config/db.js";


// 🧾 Thêm món chính (chưa cộng topping)
export const addProductItemToOrder = async (order_id, item) => {
  const sizeIdValue =
    item.size_id && item.size_id !== 0 ? item.size_id : null;

  // ✅ Lấy giá gốc của sản phẩm (theo size nếu có)
  let basePrice = 0;

  if (item.product_id && sizeIdValue) {
    const [[row]] = await db.query(
      `SELECT p.price + s.price_modifier AS price
       FROM products p
       JOIN sizes s ON s.id = ?
       WHERE p.id = ?`,
      [sizeIdValue, item.product_id]
    );
    basePrice = row?.price || 0;
  } else if (item.product_id) {
    const [[row]] = await db.query(
      `SELECT price FROM products WHERE id = ?`,
      [item.product_id]
    );
    basePrice = row?.price || 0;
  }

  // ✅ Ghi vào DB chỉ giá gốc
  const [result] = await db.query(
    `INSERT INTO order_items
     (order_id, product_id, size_id, quantity, price, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      order_id,
      item.product_id,
      sizeIdValue,
      item.quantity,
      basePrice, // 💰 chỉ lưu giá gốc
      item.note || null,
    ]
  );

  return result.insertId;
};

// 🍧 Thêm topping vào món chính — tự nhân số lượng theo món cha
export const addToppingToOrderItem = async (order_id, parent_item_id, topping) => {
  if (!topping || !topping.name) {
    console.warn("⚠️ Bỏ qua topping không hợp lệ:", topping);
    return;
  }

  // ✅ Lấy topping_id theo tên (nếu có)
  let toppingId = null;
  const [[found]] = await db.query(
    `SELECT id FROM toppings WHERE name = ? LIMIT 1`,
    [topping.name]
  );

  if (found) {
    toppingId = found.id;
  } else {
    // Nếu chưa có, thêm mới topping
    const [insertResult] = await db.query(
      `INSERT INTO toppings (name, price) VALUES (?, ?)`,
      [topping.name, parseFloat(topping.price) || 0]
    );
    toppingId = insertResult.insertId;
  }

  // ✅ Lấy số lượng món cha (để nhân topping)
  const [[parentItem]] = await db.query(
    `SELECT quantity FROM order_items WHERE id = ? LIMIT 1`,
    [parent_item_id]
  );
  const parentQty = parentItem?.quantity || 1;

  // ✅ Lưu topping (quantity = theo món chính)
  const [result] = await db.query(
    `INSERT INTO order_items (order_id, product_id, size_id, topping_id, quantity, price, parent_item_id)
     VALUES (?, NULL, NULL, ?, ?, ?, ?)`,
    [
      order_id,
      toppingId,
      parentQty, // 👈 nhân theo số lượng nước
      parseFloat(topping.price) || 0,
      parent_item_id,
    ]
  );

  return result.insertId;
};


// 🔄 Cập nhật tổng tiền đơn
export const updateOrderTotal = async (order_id) => {
  await db.query(
    `UPDATE orders
     SET total = (
       SELECT COALESCE(SUM(price * quantity), 0)
       FROM order_items WHERE order_id = ?
     )
     WHERE id = ?`,
    [order_id, order_id]
  );
};

export const getOrderIdByItemId = async (order_item_id) => {
  const [[row]] = await db.query(
    'SELECT order_id FROM order_items WHERE id = ?',
    [order_item_id]
  );
  return row;
};

// 📦 Lấy giá sản phẩm (theo product + size)
export const getProductPrice = async (product_id, size_id) => {
  const [[row]] = await db.query(
    `SELECT p.price + s.price_modifier AS price
     FROM products p
     JOIN sizes s ON s.id = ?
     WHERE p.id = ?`,
    [size_id, product_id]
  );
  return row?.price || 0;
};

// 🍧 Lấy giá topping
export const getToppingPrice = async (topping_id) => {
  const [[row]] = await db.query(
    'SELECT price FROM toppings WHERE id = ?',
    [topping_id]
  );
  return row?.price || 0;
};
