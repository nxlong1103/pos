// controllers/size.controller.js
import { getAllSizesModel } from '../../models/size.model.js';

// 📏 Lấy danh sách size
export const getAllSizes = async (req, res) => {
  try {
    const sizes = await getAllSizesModel();
    res.json(sizes);
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách size:', err);
    res.status(500).json({ message: 'Lỗi server khi truy vấn sizes' });
  }
};
