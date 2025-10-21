import express from 'express';
import { getTables } from '../../controllers/pos/table.controller.js';

const router = express.Router();
router.get('/', getTables);
export default router;
