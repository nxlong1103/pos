// backend/models/dashboard.model.js
import { db } from "../config/db.js";

// 🔹 Tổng đơn hàng hôm nay
export const getTodayOrdersCount = async () => {
  const [[{ total_orders }]] = await db.query(`
    SELECT COUNT(*) AS total_orders
    FROM orders
    WHERE status = 'paid' AND DATE(created_at) = CURDATE()
  `);
  return total_orders;
};

// 🔹 Tổng doanh thu theo điều kiện ngày
export const getRevenue = async (dateCondition) => {
  const [[{ total_revenue }]] = await db.query(`
    SELECT IFNULL(SUM(total), 0) AS total_revenue
    FROM orders
    WHERE ${dateCondition} AND status = 'paid'
  `);
  return total_revenue;
};

// 🔹 Tổng khách hàng
export const getTotalCustomers = async () => {
  const [[{ total_customers }]] = await db.query(`
    SELECT COUNT(*) AS total_customers FROM customers
  `);
  return total_customers;
};

// 🔹 Doanh thu hôm qua
export const getYesterdayRevenue = async () => {
  const [[{ yesterday_revenue }]] = await db.query(`
    SELECT IFNULL(SUM(total),0) AS yesterday_revenue
    FROM orders
    WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY AND status = 'paid'
  `);
  return yesterday_revenue;
};

// 🔹 Đơn đang phục vụ hôm nay
export const getServingOrders = async () => {
  const [serving_orders] = await db.query(`
    SELECT o.id, t.name AS table_name, o.total, o.created_at
    FROM orders o
    LEFT JOIN tables t ON o.table_id = t.id
    WHERE o.status = 'pending' AND DATE(o.created_at) = CURDATE()
    ORDER BY o.created_at DESC
  `);
  return serving_orders;
};

// 🔹 Biểu đồ doanh thu
export const getRevenueChart = async (dateCondition, mode) => {
  let query = "";
  if (mode === "hour") {
    query = `
      SELECT LPAD(HOUR(created_at), 2, '0') AS label, SUM(total) AS revenue
      FROM orders
      WHERE ${dateCondition} AND status = 'paid'
      GROUP BY HOUR(created_at)
      ORDER BY label ASC
    `;
  } else if (mode === "day") {
    query = `
      SELECT DATE_FORMAT(created_at, '%d/%m') AS label, SUM(total) AS revenue
      FROM orders
      WHERE ${dateCondition} AND status = 'paid'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `;
  } else if (mode === "weekday") {
    query = `
      SELECT 
        CASE DAYOFWEEK(created_at)
          WHEN 1 THEN 'CN'
          WHEN 2 THEN 'T2'
          WHEN 3 THEN 'T3'
          WHEN 4 THEN 'T4'
          WHEN 5 THEN 'T5'
          WHEN 6 THEN 'T6'
          WHEN 7 THEN 'T7'
        END AS label,
        SUM(total) AS revenue
      FROM orders
      WHERE ${dateCondition} AND status = 'paid'
      GROUP BY DAYOFWEEK(created_at)
      ORDER BY FIELD(label, 'T2','T3','T4','T5','T6','T7','CN')
    `;
  }

  const [rows] = await db.query(query);
  return rows;
};

// 🔹 Biểu đồ khách hàng
export const getCustomerChart = async (dateCondition, mode) => {
  let query = "";
  if (mode === "hour") {
    query = `
      SELECT CONCAT(LPAD(HOUR(created_at), 2, '0'), ':00') AS label, COUNT(*) AS customers
      FROM customers
      WHERE ${dateCondition}
      GROUP BY HOUR(created_at)
      ORDER BY HOUR(created_at)
    `;
  } else if (mode === "day") {
    query = `
      SELECT DATE_FORMAT(created_at, '%d/%m') AS label, COUNT(*) AS customers
      FROM customers
      WHERE ${dateCondition}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `;
  } else if (mode === "weekday") {
    query = `
      SELECT 
        CASE DAYOFWEEK(created_at)
          WHEN 1 THEN 'CN'
          WHEN 2 THEN 'T2'
          WHEN 3 THEN 'T3'
          WHEN 4 THEN 'T4'
          WHEN 5 THEN 'T5'
          WHEN 6 THEN 'T6'
          WHEN 7 THEN 'T7'
        END AS label,
        COUNT(*) AS customers
      FROM customers
      WHERE ${dateCondition}
      GROUP BY DAYOFWEEK(created_at)
      ORDER BY FIELD(label, 'T2','T3','T4','T5','T6','T7','CN')
    `;
  }

  const [rows] = await db.query(query);
  return rows;
};
// 🔹 Top sản phẩm bán chạy
export const getTopProducts = async (range, type) => {
  let dateCondition = "";
  if (range === "today") dateCondition = "DATE(o.created_at) = CURDATE()";
  else if (range === "yesterday") dateCondition = "DATE(o.created_at) = CURDATE() - INTERVAL 1 DAY";
  else if (range === "7days") dateCondition = "DATE(o.created_at) >= CURDATE() - INTERVAL 6 DAY";
  else if (range === "30days") dateCondition = "DATE(o.created_at) >= CURDATE() - INTERVAL 29 DAY";
  else dateCondition = "DATE(o.created_at) = CURDATE()";

  const query =
    type === "revenue"
      ? `
      SELECT 
        p.name AS product_name,
        SUM(oi.quantity * oi.price) AS total_value
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.status = 'paid' AND ${dateCondition}
      GROUP BY p.id, p.name
      ORDER BY total_value DESC
      LIMIT 10;
    `
      : `
      SELECT 
        p.name AS product_name,
        SUM(oi.quantity) AS total_value
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.status = 'paid' AND ${dateCondition}
      GROUP BY p.id, p.name
      ORDER BY total_value DESC
      LIMIT 10;
    `;

  const [rows] = await db.query(query);
  return rows;
};
