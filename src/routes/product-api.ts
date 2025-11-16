import express from "express";
import { getProductDetail, getProductReview, getRelatedProduct } from "../controllers/ProductController";
import authenticateToken from "../middleware/auth";

const route = express.Router();

route.get('/products/:inventoryId',authenticateToken, getProductDetail);
route.get('/reviews/:shopId/:productId',authenticateToken, getProductReview);
route.get('/related-products/:inventoryId',authenticateToken, getRelatedProduct);
export default route;