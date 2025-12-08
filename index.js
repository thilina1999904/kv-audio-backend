import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

let app = express()

app.use(bodyParser.json());

app.use((req,res,next)=>{
    let token = req.headers["authorization"]
     if(token!=null){
        token = token.replace("Bearer ","")
            
        jwt.verify(token,"kvsecretkey123",(err,decoded)=>{
            if(!err){
                req.user = decoded;
            
            }
        });
     }
     next();
})

let mongoUrl = "mongodb+srv://Admin:Thilina@cluster0.ljenjum.mongodb.net/?appName=Cluster0"

mongoose.connect(mongoUrl)

let connection = mongoose.connection
connection.once("open",()=>{
    console.log("database Connected Successfully!");
})

app.use("/api/users",userRouter)
app.use("/api/products",productRouter)

app.listen(3000, () => {
    console.log("servr is running on port 3000");
})