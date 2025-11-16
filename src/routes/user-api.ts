// user api
import express from "express";
import { getUsers, addUser } from "../controllers/UserController";
import authUser from "../middleware/auth";

const router = express.Router();

router.get("/", authUser, getUsers);
router.post("/",addUser);

export default router;