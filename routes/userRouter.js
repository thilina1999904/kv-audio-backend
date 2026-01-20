import express from "express"
import { blockedOrUnblockedUser, getAllUsers, getUser, loginUser, loginWithGoogle, registerUser } from "../controllers/userController.js";

const userRouter = express.Router()

userRouter.post("/",registerUser)
userRouter.post("/login",loginUser)
userRouter.get("/all",getAllUsers)
userRouter.get("/me",getUser)
userRouter.put("/block/:email",blockedOrUnblockedUser)
userRouter.post("/google", loginWithGoogle);


export default  userRouter;

