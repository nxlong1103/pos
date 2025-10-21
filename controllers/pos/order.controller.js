// controllers/order.controller.js
import {
  findPendingOrderByTable,
  insertOrder,
  findCustomerByOrderId,
  getOrderTotal,
  updateCustomerPoints,
  getDetailedOrdersModel,
  getOrderItems,
  getOrderToppings,
  getOrderCombos,
} from '../../models/order.model.js';

import {
  addProductItemToOrder,
  addToppingToOrderItem,
  updateOrderTotal,
} from '../../models/orderItem.model.js';

import { addComboToOrderModel } from '../../models/combo.model.js';

// 🧩 Khởi tạo đơn hàng mới cho bàn (nếu chưa có đơn pending)
export const startOrder = async (req, res) => {
  try {
    const { table_id, customer_id } = req.body;
    if (!table_id) return res.status(400).json({ error: 'Thiếu table_id' });

    const existing = await findPendingOrderByTable(table_id);
    if (existing.length > 0) {
      return res.json({
        order_id: existing[0].id,
        message: 'Bàn này đang có đơn chưa thanh toán',
      });
    }

    const order_id = await insertOrder(table_id, customer_id);
    res.json({ order_id, message: 'Tạo đơn hàng mới thành công' });
  } catch (err) {
    console.error('❌ Lỗi khi khởi tạo order:', err);
    res.status(500).json({ error: 'Không thể tạo đơn hàng' });
  }
};

// ➕ Tạo đơn hàng đầy đủ (gửi từ Flutter)
export const createOrder = async (req, res) => {
  try {
    const { table_id, customer_id, items } = req.body;
    if (!table_id || !items?.length)
      return res.status(400).json({ error: 'Thiếu dữ liệu đơn hàng' });

    // 1️⃣ Tạo đơn hàng chính
    const order_id = await insertOrder(table_id, customer_id);
    console.log(`🧾 Tạo order mới #${order_id}`);

    // 2️⃣ Thêm từng món vào order
    for (const item of items) {
      if (item.is_combo) {
        // 🎁 Thêm combo
        const comboId = item.combo_id ?? item.id;
        if (!comboId) {
          console.warn('⚠️ Bỏ qua combo vì thiếu combo_id:', item);
          continue;
        }

        // 👇 truyền quantity + note
        await addComboToOrderModel(order_id, comboId, item.note || null, item.quantity || 1);
        console.log(`🎁 Thêm combo: ${item.product_name} ×${item.quantity || 1}`);
        
      } else {
        // 🍽️ Thêm món riêng
        if (item.size_id === 0 || item.size_id === '0' || !item.size_id) {
          item.size_id = null;
        }
        const orderItemId = await addProductItemToOrder(order_id, item);
        console.log(`🍽️ Thêm món: ${item.product_name}`);

        // 🍧 Thêm topping
        for (const topping of item.toppings || []) {
          await addToppingToOrderItem(order_id, orderItemId, topping);
          console.log(`➕ Topping: ${topping.name}`);
        }
      }
    }

    // 3️⃣ Cập nhật tổng tiền
    await updateOrderTotal(order_id);

    // 4️⃣ Nếu đơn có khách hàng, cộng điểm luôn
    if (customer_id) {
      try {
        const total = await getOrderTotal(order_id);
        const points = Math.floor(total / 1000);
        await updateCustomerPoints(customer_id, points);
        console.log(`💎 Cộng ${points} điểm cho khách #${customer_id}`);
      } catch (err) {
        console.error('⚠️ Lỗi cộng điểm:', err);
      }
    }

    // 5️⃣ Trả kết quả về
    res.json({
      message: '✅ Tạo đơn hàng đầy đủ thành công',
      order_id,
    });
  } catch (err) {
    console.error('❌ Lỗi khi tạo đơn hàng đầy đủ:', err);
    res.status(500).json({ error: 'Không thể tạo đơn hàng' });
  }
};

// 💎 Cộng điểm cho khách
export const updatePoints = async (req, res) => {
  try {
    const { order_id } = req.body;
    const order = await findCustomerByOrderId(order_id);
    if (!order?.customer_id)
      return res.status(400).json({ error: 'Đơn không có khách hàng' });

    const total = await getOrderTotal(order_id);
    const points = Math.floor(total / 1000);
    await updateCustomerPoints(order.customer_id, points);

    res.json({ message: `✅ Cộng ${points} điểm thành công` });
  } catch (err) {
    console.error('❌ Lỗi cộng điểm:', err);
    res.status(500).json({ error: 'Không thể cộng điểm' });
  }
};

// 📋 Lấy danh sách đơn chi tiết (hiển thị POS)
export const getDetailedOrders = async (req, res) => {
  try {
    const orders = await getDetailedOrdersModel();

    for (const order of orders) {
      const items = await getOrderItems(order.id);
      const toppings = await getOrderToppings(order.id);
      const combos = await getOrderCombos(order.id);

      // Gắn topping cho đúng món
      for (const item of items) {
        const itemToppings = toppings.filter(t => t.parent_item_id === item.id);
        item.toppings = itemToppings.map(t => ({
          name: t.name,
          price: parseFloat(t.price),
        }));

        const toppingTotal = itemToppings.reduce((sum, t) => sum + parseFloat(t.price), 0);
        item.price = parseFloat(item.price) + toppingTotal;
      }

      // Gắn combo
      const comboItems = combos.map(cb => ({
        id: cb.id,
        product_name: cb.combo_name,
        size_name: '',
        quantity: cb.quantity,
        price: cb.order_price || cb.combo_price,
        note: cb.note || '',
        toppings: [],
        is_combo: true,
        combo_items: cb.items.map(it => ({
          name: it.name,
          price: parseFloat(it.price),
        })),
      }));

      order.items = [
        ...comboItems,
        ...items.map(it => ({ ...it, is_combo: false })),
      ];
    }

    res.json(orders);
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách đơn:', err);
    res.status(500).json({ error: 'Không thể lấy danh sách đơn hàng' });
  }
};
