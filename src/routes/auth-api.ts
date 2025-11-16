//auth api
import express from "express";
import { loginUser, sendOtp, loginWithOtp, logoutUser, registerUser, registerCustomer,registerVendor, registerDeliveryBoy } from "../controllers/AuthController";
import authenticateToken from "../middleware/auth";

const router = express.Router();

router.post('/register/customer',registerCustomer);
router.post('/register/vendor',registerVendor);
router.post('/register/delivery-boy',registerDeliveryBoy);

router.post('/login-with-otp',loginWithOtp);
router.post('/send-otp',sendOtp);
router.post('/login',loginUser);
router.post('/logout',authenticateToken, logoutUser);
export default router;