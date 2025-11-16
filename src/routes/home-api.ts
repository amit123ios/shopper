//home-api
import express from "express";
import { category_data } from "../controllers/HomeController";
import authenticateToken from "../middleware/auth";
const router = express.Router();

router.get('/categories',authenticateToken, category_data);

export default router;


const fs = require("fs");