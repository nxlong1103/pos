import express from 'express';
import { getAllCombos } from '../../controllers/pos/combo.controller.js';

const router = express.Router();
router.get('/', getAllCombos);

export default router;
