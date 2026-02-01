import express from "express";
import {
  getPublishedImages,
  getUser,
  loginUser,
  registerUser,
} from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";

const userRoute = express.Router();

userRoute.post("/register", registerUser);
userRoute.post("/login", loginUser);
userRoute.get("/data", getUser);
userRoute.get("/published-images", getPublishedImages);

export default userRoute;
