import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import reviewRouter from "./routes/reviewRouter.js";
import inquiryRouter from "./routes/inquiryRouter.js";
import cors from "cors";
import orderRouter from "./routes/orderRouter.js";
import adminRouter from "./routes/adminRouter.js";

dotenv.config();

let app = express();

// CORS - Vercel frontend එකට access දීමට පහසුයි
app.use(cors());

app.use(bodyParser.json());

// Auth Middleware
app.use((req, res, next) => {
    let token = req.headers["authorization"];
    if (token != null) {
        token = token.replace("Bearer ", "");
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (!err) {
                req.user = decoded;
            }
        });
    }
    next();
});

// MongoDB Connection
let mongoUrl = process.env.MONGO_URL;
mongoose.connect(mongoUrl)
    .then(() => console.log("Database Connected Successfully!"))
    .catch((err) => console.log("Database connection error: ", err));

// Routes
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/inquiries", inquiryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin/", adminRouter);

// Root Route (Host එක වැඩද බලන්න)
app.get("/", (req, res) => {
    res.send("vegaz Backend is running on Koyeb!");
});

// PORT එක Koyeb එකෙන් දෙන එක ගන්නවා, නැත්නම් 3000 ගන්නවා
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});