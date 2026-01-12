import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import reviewRouter from "./routes/reviewRouter.js";
import inquiryRouter from "./routes/inquiryRouter.js";
import cors from "cors";
import orderRouter from "./routes/orderRouter.js";


dotenv.config();

let app = express()
app.use(cors());

app.use(bodyParser.json());

app.use((req,res,next)=>{
    let token = req.headers["authorization"]
     if(token!=null){
        token = token.replace("Bearer ","")
            
        jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
            if(!err){
                req.user = decoded;
            }
        });
     }
     next();
})

let mongoUrl = process.env.MONGO_URL;

mongoose.connect(mongoUrl)

let connection = mongoose.connection
connection.once("open",()=>{
    console.log("Database Connected Successfully!");
})

app.use("/api/users",userRouter);
app.use("/api/products",productRouter);
app.use("/api/reviews",reviewRouter);
app.use("/api/inquiries",inquiryRouter);
app.use("/api/orders",orderRouter);
app.listen(3000, () => {
    console.log("Server is running on port 3000");
})


//admin
  //"email": "admin@gmail.com",
  //"Password": "Admin@123"

//customer
   //"email": "customer1@gmail.com"
  //"Password": "Customer@123",

//   {
//   "email": "customer.test@example.com",
//   "password": "CustomerPassword123!"
// }

// {
//   "email": "admin45@gmail.com",
//   "password": "123456"
// }


// "email": "admin@kv-audio.lk",
//   "password": "adminSecret2026",

//   {
//   "email": "customer1@example.com",
//   "password": "password123",