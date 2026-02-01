import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRoute from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import creditRouter from "./routes/creditRoutes.js";
import { stripeWebhooks } from "./controllers/webhooks.js";

const app = express();

await connectDB();

//stripe webhooks

app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks,
);

//middleware
app.use(cors());
app.use(express.json());

//routes
app.get("/", (req, res) => {
  res.send("server is Running");
});
app.use("/api/user", userRoute);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/credit", creditRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});
