// controllers/topping.controller.js
import { getAllToppingsModel } from '../../models/topping.model.js';

// 🍧 Lấy danh sách topping
export const getToppings = async (req, res) => {
  try {
    const toppings = await getAllToppingsModel();
    res.json(toppings);
  } catch (err) {
    console.error('❌ Lỗi khi lấy topping:', err);
    res.status(500).json({ error: 'Không thể lấy danh sách topping' });
  }
};
