import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository.js";

const userRepo = new UserRepository();
const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  if (!PASSWORD_RULES.test(password)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character",
    });
  }

  const existing = await userRepo.findByEmail(email);
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepo.create({ name, email, passwordHash });
  const token = signToken(user);
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = await userRepo.findByEmail(email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}
