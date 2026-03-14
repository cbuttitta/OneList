import express from "express";
import authRoutes from "./auth.js";
import listRoutes from "./lists.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/lists", listRoutes);

export default router;