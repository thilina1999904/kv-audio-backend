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

// 1. CORS සැකසුම (අනිවාර්යයෙන්ම Routes වලට උඩින් තිබිය යුතුයි)
app.use(cors({
  origin: ["https://kv-audio-frontend-n.vercel.app", "http://localhost:5173"], // Frontend එකේ URL එක
  credentials: true
}));

app.use(bodyParser.json());

// 2. Auth Middleware
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

// 3. MongoDB Connection
let mongoUrl = process.env.MONGO_URL;
mongoose.connect(mongoUrl)
    .then(() => console.log("Database Connected Successfully!"))
    .catch((err) => console.log("Database connection error: ", err));

// 4. Routes
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/inquiries", inquiryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
    res.send("Skyrek Backend is running on Vercel!");
});

// 5. Port and Export
const PORT = process.env.PORT || 3000;

// Local test කරනවා නම් විතරක් මේක වැඩ කරයි, Vercel එකට export default app අවශ්‍යයි
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;