import express from 'express';
import { approveOrder, createOrder, declineOrder, getOrders, getQuote } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post ("/",createOrder)
orderRouter.post ("/quote",getQuote)
orderRouter.get ("/",getOrders)
orderRouter.put("/:orderId/approve", approveOrder);
orderRouter.put("/:orderId/decline", declineOrder);



export default orderRouter;