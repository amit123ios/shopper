import express from "express";
import { getShops, getShopProducts } from "../controllers/ShopController";
import authUser from "../middleware/auth";

const route = express.Router();

route.get('/shops/:categoryId',authUser, getShops);
route.get('/shops',authUser, getShops);
route.get('/shop/:shopId',authUser, getShopProducts);

export default route;


