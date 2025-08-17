import express, { Router } from "express";
import { getActiveSliders } from "../controllers/slider.controller";

const router: Router = express.Router();

// Public endpoint to get active sliders for home page
router.get("/active", getActiveSliders);

export default router;
