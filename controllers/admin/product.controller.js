
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import * as XLSX from "xlsx";
import {
  getAllProductsModel,
  getProductById,
  addProductModel,
  updateProductModel,
  deleteProductModel,
} from "../../models/product.model.js";
import {
  getAllSizesModel,
  addSizeModel,
  updateSizeModel,
  deleteSizeModel,
} from "../../models/size.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🖼️ Cấu hình upload hình ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/products");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
export const upload = multer({ storage });

// ======================= PRODUCT CONTROLLER =======================

// 🔹 Lấy danh sách sản phẩm
export const getProducts = async (req, res) => {
  try {
    const products = await getAllProductsModel();
    const data = products.map((p) => ({
      ...p,
      image_url: p.image
        ? `http://localhost:5000/uploads/products/${p.image}`
        : null,
    }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm" });
  }
};

// 🔹 Thêm sản phẩm
export const addProduct = async (req, res) => {
  try {
    const image = req.file ? req.file.filename : null;
    await addProductModel({ ...req.body, image });
    res.json({ message: "✅ Thêm sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi khi thêm sản phẩm" });
  }
};

// 🔹 Cập nhật sản phẩm (có thể đổi ảnh)
export const updateProduct = async (req, res) => {
  try {
    const newImage = req.file ? req.file.filename : null;
    const old = await getProductById(req.params.id);

    if (newImage && old?.image) {
      const oldPath = path.join(__dirname, "../../uploads/products", old.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await updateProductModel(req.params.id, { ...req.body, image: newImage });
    res.json({ message: "✅ Cập nhật sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi khi cập nhật sản phẩm" });
  }
};

// 🔹 Xóa sản phẩm (và ảnh)
export const deleteProduct = async (req, res) => {
  try {
    const old = await getProductById(req.params.id);
    if (old?.image) {
      const filePath = path.join(__dirname, "../../uploads/products", old.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await deleteProductModel(req.params.id);
    res.json({ message: "✅ Xóa sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ message: "❌ Lỗi khi xóa sản phẩm" });
  }
};

// ======================= SIZE CONTROLLER (nằm trong Product) =======================

// 🔹 Lấy danh sách size
export const getSizes = async (req, res) => {
  try {
    const rows = await getAllSizesModel();
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Lỗi khi lấy danh sách size" });
  }
};

// 🔹 Thêm size
export const addSize = async (req, res) => {
  try {
    const { name, price_modifier } = req.body;
    await addSizeModel(name, price_modifier);
    res.json({ message: "✅ Thêm size thành công" });
  } catch {
    res.status(500).json({ message: "Lỗi khi thêm size" });
  }
};

// 🔹 Cập nhật size
export const updateSize = async (req, res) => {
  try {
    const { name, price_modifier } = req.body;
    await updateSizeModel(req.params.id, name, price_modifier);
    res.json({ message: "✅ Cập nhật size thành công" });
  } catch {
    res.status(500).json({ message: "Lỗi khi cập nhật size" });
  }
};

// 🔹 Xóa size
export const deleteSize = async (req, res) => {
  try {
    await deleteSizeModel(req.params.id);
    res.json({ message: "✅ Xóa size thành công" });
  } catch {
    res.status(500).json({ message: "Lỗi khi xóa size" });
  }
};

// ======================= EXPORT EXCEL =======================
export const exportProductsToExcel = async (req, res) => {
  try {
    const products = await getAllProductsModel();
    const rows = products.map((p) => ({
      ID: p.id,
      "Tên sản phẩm": p.name,
      "Danh mục": p.category_name,
      Giá: p.price,
      "Trạng thái": p.status,
    }));

    const exportDir = path.join(__dirname, "../../exports");
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sản phẩm");
    const filePath = path.join(exportDir, "products.xlsx");
    XLSX.writeFile(workbook, filePath);
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xuất Excel" });
  }
};
