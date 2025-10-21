import dayjs from "dayjs";
import {
  getTodayOrdersCount,
  getRevenue,
  getTotalCustomers,
  getYesterdayRevenue,
  getServingOrders,
  getRevenueChart,
  getCustomerChart,
} from "../../models/dashboard.model.js";

export const getDashboardOverview = async (req, res) => {
  try {
    const range = req.query.range || "today";
    const mode = req.query.mode || "day";
    const start = req.query.start;
    const end = req.query.end;

    // 🕒 Xác định điều kiện thời gian
    let dateCondition = "";
    if (start && end) dateCondition = `DATE(created_at) BETWEEN '${start}' AND '${end}'`;
    else if (range === "today") dateCondition = "DATE(created_at) = CURDATE()";
    else if (range === "yesterday") dateCondition = "DATE(created_at) = CURDATE() - INTERVAL 1 DAY";
    else if (range === "7days") dateCondition = "DATE(created_at) >= CURDATE() - INTERVAL 6 DAY";
    else if (range === "30days") dateCondition = "DATE(created_at) >= CURDATE() - INTERVAL 29 DAY";
    else dateCondition = "DATE(created_at) = CURDATE()";

    // 🟢 Lấy dữ liệu tổng hợp
    const [total_orders, total_revenue, total_customers, yesterday_revenue, serving_orders] =
      await Promise.all([
        getTodayOrdersCount(),
        getRevenue(dateCondition),
        getTotalCustomers(),
        getYesterdayRevenue(),
        getServingOrders(),
      ]);

    // 📈 Biểu đồ doanh thu & khách hàng
    let [revenue_data, customer_chart] = await Promise.all([
      getRevenueChart(dateCondition, mode),
      getCustomerChart(dateCondition, mode),
    ]);

    // Bổ sung giờ/thứ trống cho biểu đồ nếu cần
    if (mode === "hour") {
      const fullHours = Array.from({ length: 24 }, (_, i) => ({
        label: i.toString().padStart(2, "0"),
        revenue: 0,
        customers: 0,
      }));
      fullHours.forEach((h) => {
        const rev = revenue_data.find((r) => r.label === h.label);
        if (rev) h.revenue = rev.revenue;
        const cus = customer_chart.find((r) => r.label === `${h.label}:00`);
        if (cus) h.customers = cus.customers;
      });
      revenue_data = fullHours;
      customer_chart = fullHours.map(({ label, customers }) => ({
        label: `${label}:00`,
        customers,
      }));
    }

    if (mode === "weekday") {
      const allWeekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((label) => ({
        label,
        revenue: 0,
        customers: 0,
      }));
      allWeekdays.forEach((w) => {
        const rev = revenue_data.find((r) => r.label === w.label);
        if (rev) w.revenue = rev.revenue;
        const cus = customer_chart.find((r) => r.label === w.label);
        if (cus) w.customers = cus.customers;
      });
      revenue_data = allWeekdays.map(({ label, revenue }) => ({ label, revenue }));
      customer_chart = allWeekdays.map(({ label, customers }) => ({ label, customers }));
    }

    // 🔺 Tính phần trăm thay đổi doanh thu
    let percent_change = 0;
    if (yesterday_revenue > 0)
      percent_change = (((total_revenue - yesterday_revenue) / yesterday_revenue) * 100).toFixed(2);

    res.json({
      range,
      mode,
      total_orders,
      total_revenue,
      yesterday_revenue,
      percent_change,
      total_customers,
      serving_orders,
      revenue_data,
      customer_chart,
    });
  } catch (error) {
    console.error("❌ Lỗi getDashboardOverview:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
};
