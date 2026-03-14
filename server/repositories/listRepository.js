import pool from "../db.js";

export class ListRepository {
  async findAllByUser(userId) {
    const { rows } = await pool.query(
      "SELECT * FROM lists WHERE user_id = $1 ORDER BY id",
      [userId]
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await pool.query("SELECT * FROM lists WHERE id = $1", [id]);
    return rows[0] || null;
  }

  async findByShareToken(token) {
    const { rows } = await pool.query(
      "SELECT * FROM lists WHERE share_token = $1",
      [token]
    );
    return rows[0] || null;
  }

  async create({ userId, name, description, is_private, passcode_hash }) {
    const { rows } = await pool.query(
      "INSERT INTO lists (user_id, name, description, is_private, passcode_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [userId, name, description || null, is_private ?? false, passcode_hash ?? null]
    );
    return rows[0];
  }

  async update(id, userId, { name, is_private, passcode_hash }) {
    const { rows } = await pool.query(
      `UPDATE lists SET
         name = COALESCE($1, name),
         is_private = COALESCE($2, is_private),
         passcode_hash = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [name, is_private, passcode_hash, id, userId]
    );
    return rows[0] || null;
  }

  async delete(id, userId) {
    const { rowCount } = await pool.query(
      "DELETE FROM lists WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return rowCount > 0;
  }
}
