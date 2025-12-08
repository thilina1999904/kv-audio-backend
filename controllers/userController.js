import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"  

dotenv.config();

export function registerUser (req,res){

    const data = req.body;

    data.Password = bcrypt.hashSync(data.Password,10)

    const newUser = new User(data)



    newUser.save().then(()=>{
        res.json({
            message : "User Registered Successfully!"
        })
    }).catch((error)=>{
        res.status(500).json({error : "User Registration Failed"})
    })
    
}

export function loginUser(req,res){
    const data = req.body;

    User.findOne({
        email : data.email
    }).then(
        (user)=>{
            if(user == null){
                res.status(404).json({error: "User Not Found"})
            }else{
                
                const isPasswordCorrect = bcrypt.compareSync(data.Password,user.Password)
                    
                if(isPasswordCorrect){

                    const token = jwt.sign({
                        firstName : user.firstName,
                        lastName : user.lastName,
                        email : user.email,
                        role : user.role
                    },process.env.JWT_SECRET)
                    res.json({
                        message: "Login Successfully",token : token
                    })
                }else{
                    res.status(401).json({error: "Login Failed"})
                }
            }
        }
    )
}