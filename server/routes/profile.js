import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/:token", async (req, res) => {
  try {
    const { rows: userRows } = await pool.query(
      "SELECT id, name FROM users WHERE profile_token = $1",
      [req.params.token]
    );
    if (!userRows.length) return res.status(404).json({ message: "Profile not found" });

    const user = userRows[0];

    const { rows: lists } = await pool.query(
      `SELECT l.id, l.name, l.list_type, l.share_token, COUNT(li.id)::int AS item_count
       FROM lists l
       LEFT JOIN list_items li ON li.list_id = l.id
       WHERE l.user_id = $1 AND l.is_private = false
       GROUP BY l.id
       ORDER BY l.id`,
      [user.id]
    );

    res.json({ name: user.name, lists });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
