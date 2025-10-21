import express from 'express';
import { getAllSizes } from '../../controllers/pos/size.controller.js';

const router = express.Router();

router.get('/', getAllSizes);

export default router;
