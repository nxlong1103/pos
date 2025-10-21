// models/order.model.js
import { db } from "../config/db.js";


// 🧩 Kiểm tra bàn đã có đơn pending chưa
export const findPendingOrderByTable = async (table_id) => {
  const [rows] = await db.query(
    'SELECT * FROM orders WHERE table_id = ? AND status = "pending"',
    [table_id]
  );
  return rows;
};

// ➕ Tạo đơn hàng mới
export const insertOrder = async (table_id, customer_id = null) => {
  const [result] = await db.query(
    'INSERT INTO orders (table_id, customer_id, status, total, created_at) VALUES (?, ?, "pending", 0, NOW())',
    [table_id, customer_id]
  );
  return result.insertId;
};

// 🔍 Lấy thông tin khách từ đơn
export const findCustomerByOrderId = async (order_id) => {
  const [[order]] = await db.query(
    'SELECT customer_id FROM orders WHERE id = ?',
    [order_id]
  );
  return order;
};

// 🔢 Tính tổng tiền của đơn
export const getOrderTotal = async (order_id) => {
  const [[sumRow]] = await db.query(
    'SELECT SUM(price * quantity) AS total FROM order_items WHERE order_id = ?',
    [order_id]
  );
  return sumRow?.total || 0;
};

// 🔁 Cập nhật điểm khách hàng
export const updateCustomerPoints = async (customer_id, points) => {
  await db.query(
    'UPDATE customers SET points = points + ? WHERE id = ?',
    [points, customer_id]
  );
};

// 📜 Lấy danh sách đơn chi tiết
export const getDetailedOrdersModel = async () => {
  const [orders] = await db.query(`
    SELECT o.id,
    o.table_id,
    t.name AS table_name,   
    o.customer_id,
    c.name AS customer_name,
    o.status,
    o.total,
    created_at
    FROM orders o
    JOIN tables t ON o.table_id = t.id
    LEFT JOIN customers c ON o.customer_id = c.id
    ORDER BY o.created_at DESC
  `);
  return orders;
};

// 📦 Lấy món chính theo order_id
export const getOrderItems = async (order_id) => {
  const [items] = await db.query(`
    SELECT oi.id, p.name AS product_name, s.name AS size_name,p.price AS base_price,
    s.price_modifier AS size_price, 
    oi.product_id, oi.size_id, oi.quantity, oi.price, oi.note
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    LEFT JOIN sizes s ON oi.size_id = s.id
    WHERE oi.order_id = ? AND oi.product_id IS NOT NULL
  `, [order_id]);
  return items;
};

// 🍧 Lấy topping theo order_id
export const getOrderToppings = async (order_id) => {
  const [toppings] = await db.query(`
    SELECT oi.parent_item_id, t.name, t.price
    FROM order_items oi
    JOIN toppings t ON oi.topping_id = t.id
    WHERE oi.order_id = ? AND oi.product_id IS NULL AND oi.parent_item_id IS NOT NULL
  `, [order_id]);
  return toppings;
};

// 🎁 Lấy combo trong đơn hàng (dựa vào combo_id)
export const getOrderCombos = async (order_id) => {
  // 🔹 Lấy combo chính trong đơn hàng
  const [combos] = await db.query(`
    SELECT 
      oi.id,
      oi.note,
      oi.combo_id,
      cb.name AS combo_name,
      cb.price AS combo_price,
      oi.price AS order_price,
      oi.quantity
    FROM order_items oi
    JOIN combos cb ON oi.combo_id = cb.id
    WHERE oi.order_id = ? AND oi.combo_id IS NOT NULL
  `, [order_id]);

  // 🔹 Với mỗi combo, truy ra các món con của combo đó
  for (const combo of combos) {
    const [items] = await db.query(`
      SELECT 
        p.name, 
        p.price
      FROM combo_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.combo_id = ?
    `, [combo.combo_id]);

    combo.items = items; // danh sách món con
  }

  return combos;
};
