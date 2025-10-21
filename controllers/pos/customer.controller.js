// controllers/customer.controller.js
import {
  getCustomerByPhoneModel,
  createCustomerModel,
} from '../../models/customer.model.js';

// 🔍 Lấy thông tin khách theo số điện thoại
export const getCustomerByPhone = async (req, res) => {
  const { phone } = req.params;

  try {
    const rows = await getCustomerByPhoneModel(phone);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Không tìm thấy khách' });
    }
  } catch (err) {
    console.error('Lỗi tìm khách:', err);
    res.status(500).json({ error: 'Lỗi truy vấn' });
  }
};

// ➕ Tạo khách hàng mới
export const createCustomer = async (req, res) => {
  const { phone, name } = req.body;

  try {
    const insertId = await createCustomerModel(phone, name);
    res.json({ id: insertId });
  } catch (err) {
    console.error('Lỗi tạo khách:', err);
    res.status(500).json({ error: 'Lỗi tạo khách hàng' });
  }
};
