import express from 'express';
import { addOrderItem, addTopping, addComboToOrder } from '../../controllers/pos/orderItem.controller.js';


const router = express.Router();
router.post('/', addOrderItem);
router.post('/toppings', addTopping);
router.post('/combo', addComboToOrder);

export default router;
