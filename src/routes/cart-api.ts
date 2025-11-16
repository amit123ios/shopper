import express from "express";
import { getCartDetail, addToCart } from "../controllers/CartController";
import authUser from "../middleware/auth";

const route = express.Router();

route.get('/cart',authUser, getCartDetail);
route.post('/cart',authUser,addToCart);
export default route;
