import express from "express";
import { UserService } from "../services/userService.js";

const router = express.Router();
const userService = new UserService();

router.get("/", (req, res) => {
  const users = userService.getAllUsers();
  res.json(users);
});

router.get("/:id", (req, res) => {
  const user = userService.getUserById(Number(req.params.id));
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

export default router;