import express from 'express';
import { startOrder, createOrder, updatePoints,  } from '../../controllers/pos/order.controller.js';
import { getDetailedOrders } from '../../controllers/pos/order.controller.js';

const router = express.Router();

// POST /api/orders/start
router.post('/start', startOrder);
router.post('/', createOrder);
router.post('/update-points', updatePoints);
router.get('/details', getDetailedOrders);

export default router;
