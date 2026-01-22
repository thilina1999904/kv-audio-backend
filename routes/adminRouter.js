import express from "express";
import { getAdminStats } from "../controllers/adminController.js";


const adminRouter = express.Router();

adminRouter.get("/dashboard", getAdminStats);

export default adminRouter;
