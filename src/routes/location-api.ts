//location-api.js
import express from "express";
import { getStates, getCities, getLocalties, getPincode } from "../controllers/LocationController";


const router = express.Router();

router.get('/states',getStates);
router.get('/states/:stateId/cities',getCities);
router.get('/cities/:cityId/localties',getLocalties);
router.get('/localties/:localityId/pincode',getPincode);

export default router;
