// controllers/orderItem.controller.js
import {
  getProductPrice,
  getToppingPrice,
  addProductItemToOrder,
  addToppingToOrderItem,
  updateOrderTotal,
  getOrderIdByItemId,
} from '../../models/orderItem.model.js';
import { addComboToOrderModel } from '../../models/combo.model.js';

/**
 * 🧩 Thêm 1 món (hoặc topping) vào đơn hàng
 */
export const addOrderItem = async (req, res) => {
  try {
    const {
      order_id,
      product_id,
      size_id,
      topping_id,
      quantity = 1,
      note,
      parent_item_id,
      combo_id,
    } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'Thiếu order_id' });
    }

    let price = 0;

    // 🍧 Nếu là topping
    if (topping_id) {
      price = await getToppingPrice(topping_id);
      if (!price) return res.status(404).json({ error: 'Không tìm thấy topping' });

      await addToppingToOrderItem(order_id, parent_item_id, { price });
      await updateOrderTotal(order_id);
      return res.json({ message: '✅ Thêm topping thành công', price });
    }

    // 🍽️ Nếu là món chính
    if (product_id) {
      if (size_id) price = await getProductPrice(product_id, size_id);
      else {
        // Nếu không có size, lấy giá gốc từ bảng products
        const [[row]] = await db.query('SELECT price FROM products WHERE id = ?', [product_id]);
        price = row?.price || 0;
      }

      const orderItemId = await addProductItemToOrder(order_id, {
        product_id,
        size_id,
        quantity,
        price,
        note,
        combo_id,
      });

      await updateOrderTotal(order_id);
      return res.json({
        message: '✅ Thêm món thành công',
        order_item_id: orderItemId,
        price,
      });
    }

    return res.status(400).json({ error: 'Không có dữ liệu món hoặc topping hợp lệ' });
  } catch (err) {
    console.error('❌ Lỗi khi thêm món vào order:', err);
    res.status(500).json({ error: 'Lỗi khi thêm món vào order' });
  }
};

/**
 * 🎁 Thêm combo vào đơn hàng
 */
export const addComboToOrder = async (req, res) => {
  try {
    let { order_id, combo_id, note } = req.body;
    order_id = parseInt(order_id);
    combo_id = parseInt(combo_id);

    if (!order_id || !combo_id) {
      return res.status(400).json({ error: 'Thiếu order_id hoặc combo_id' });
    }

    const result = await addComboToOrderModel(order_id, combo_id, note || null);

    await updateOrderTotal(order_id);

    res.json({
      message: '✅ Thêm combo vào đơn hàng thành công!',
      ...result,
    });
  } catch (err) {
    console.error('❌ Lỗi khi thêm combo:', err);
    res.status(500).json({ error: 'Không thể thêm combo vào đơn' });
  }
};

/**
 * 🍧 Thêm topping vào món có sẵn
 */
export const addTopping = async (req, res) => {
  try {
    const { order_item_id, topping_id } = req.body;

    if (!order_item_id || !topping_id)
      return res.status(400).json({ error: 'Thiếu order_item_id hoặc topping_id' });

    const mainItem = await getOrderIdByItemId(order_item_id);
    if (!mainItem)
      return res.status(404).json({ error: 'Không tìm thấy món chính' });

    const toppingPrice = await getToppingPrice(topping_id);
    if (!toppingPrice)
      return res.status(404).json({ error: 'Không tìm thấy topping' });

    await addToppingToOrderItem(mainItem.order_id, order_item_id, { price: toppingPrice });
    await updateOrderTotal(mainItem.order_id);

    res.json({ message: '✅ Topping thêm thành công' });
  } catch (err) {
    console.error('❌ Lỗi khi thêm topping:', err);
    res.status(500).json({ error: 'Lỗi khi thêm topping vào món' });
  }
};
