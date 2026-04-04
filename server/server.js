import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api.js";
import { runMigrations } from "./migrate.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;
runMigrations()
  .then(() => app.listen(PORT, () => console.log(`Backend running on port ${PORT}`)))
  .catch((e) => { console.error(e.message); process.exit(1); });
