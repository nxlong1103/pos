import express from 'express';
import { getCustomerByPhone, createCustomer } from '../../controllers/pos/customer.controller.js';

const router = express.Router();

router.get('/:phone', getCustomerByPhone);
router.post('/', createCustomer);

export default router;
