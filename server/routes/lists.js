import express from "express";
import * as listController from "../controllers/listController.js";
import * as listItemController from "../controllers/listItemController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Public share routes — no auth required
router.get("/share/:token", listController.getByShareToken);
router.post("/share/:token/verify", listController.verifyPasscode);
router.put("/share/:token/items/:itemId", listController.claimItem);

// All routes below require a valid JWT
router.use(requireAuth);

router.get("/", listController.getAll);
router.get("/archived", listController.getArchived);
router.post("/", listController.create);
router.get("/:id", listController.getOne);
router.put("/:id", listController.update);
router.put("/:id/archive", listController.archive);
router.post("/:id/duplicate", listController.duplicate);
router.delete("/:id", listController.remove);

router.get("/:id/items", listItemController.getAll);
router.post("/:id/items", listItemController.create);
router.put("/:id/items/:itemId", listItemController.update);
router.put("/:id/items/:itemId/edit", listItemController.editItem);
router.put("/:id/items/:itemId/reorder", listItemController.reorder);
router.delete("/:id/items/:itemId", listItemController.remove);

export default router;
