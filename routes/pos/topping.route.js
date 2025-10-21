import express from 'express';
import { getToppings } from '../../controllers/pos/topping.controller.js';

const router = express.Router();

router.get('/', getToppings);

export default router;
