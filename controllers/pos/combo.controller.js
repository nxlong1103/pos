// controllers/combo.controller.js
import { getAllCombosModel } from '../../models/combo.model.js';

// 🔹 Lấy tất cả combo + món trong combo
export const getAllCombos = async (req, res) => {
  try {
    const combos = await getAllCombosModel();
    res.json(combos);
  } catch (err) {
    console.error('❌ Lỗi khi lấy combo:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy combo' });
  }
};
