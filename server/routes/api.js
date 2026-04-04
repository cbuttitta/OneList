import express from "express";
import authRoutes from "./auth.js";
import listRoutes from "./lists.js";
import previewRoutes from "./preview.js";
import profileRoutes from "./profile.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/lists", listRoutes);
router.use("/preview", previewRoutes);
router.use("/profile", profileRoutes);

export default router;