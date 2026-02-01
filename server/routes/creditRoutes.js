import express from "express";
import { getplans, purchasePlan } from "../controllers/creditController.js";
import { protect } from "../middlewares/auth.js";

const creditRouter = express.Router();

creditRouter.get("/plans", getplans);
creditRouter.post("/purchase", protect, purchasePlan);

export default creditRouter;
