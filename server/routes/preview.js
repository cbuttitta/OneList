import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { fetchPreview } from "../controllers/previewController.js";

const router = express.Router();

router.post("/", requireAuth, fetchPreview);

export default router;
