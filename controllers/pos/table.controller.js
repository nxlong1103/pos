// controllers/table.controller.js
import { getAllTablesModel } from '../../models/table.model.js';

// 🪑 Lấy danh sách bàn
export const getTables = async (req, res) => {
  try {
    const tables = await getAllTablesModel();
    res.json(tables);
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách bàn:', err);
    res.status(500).json({ error: 'Không thể lấy danh sách bàn' });
  }
};
