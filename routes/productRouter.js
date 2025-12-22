import express from 'express';
import { addProduct } from '../controllers/productController.js';
import { getProducts } from '../controllers/productController.js';
import { updateProduct } from '../controllers/productController.js';
import { deleteProduct } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post("/",addProduct)
productRouter.get("/",getProducts)
productRouter.put("/:key",updateProduct)
productRouter.delete("/:key",deleteProduct)

export default productRouter;