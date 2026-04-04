import pool from "../db.js";

export class ListRepository {
  async findAllByUser(userId, { includeArchived = false } = {}) {
    const { rows } = await pool.query(
      `SELECT l.*, COUNT(li.id)::int AS item_count
       FROM lists l
       LEFT JOIN list_items li ON li.list_id = l.id
       WHERE l.user_id = $1 AND ($2 OR l.is_archived = false)
       GROUP BY l.id
       ORDER BY l.id`,
      [userId, includeArchived]
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

  async create({ userId, name, description, list_type, is_private, passcode_hash }) {
    const { rows } = await pool.query(
      "INSERT INTO lists (user_id, name, description, list_type, is_private, passcode_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [userId, name, description || null, list_type || null, is_private ?? false, passcode_hash ?? null]
    );
    return rows[0];
  }

  async update(id, userId, { name, is_private, passcode_hash, surprise_mode }) {
    const { rows } = await pool.query(
      `UPDATE lists SET
         name = COALESCE($1, name),
         is_private = COALESCE($2, is_private),
         passcode_hash = $3,
         surprise_mode = COALESCE($4, surprise_mode)
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [name, is_private, passcode_hash, surprise_mode, id, userId]
    );
    return rows[0] || null;
  }

  async archive(id, userId) {
    const { rows } = await pool.query(
      "UPDATE lists SET is_archived = NOT is_archived WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );
    return rows[0] || null;
  }

  async duplicate(id, userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows: origRows } = await client.query(
        "SELECT * FROM lists WHERE id = $1 AND user_id = $2",
        [id, userId]
      );
      if (!origRows.length) { await client.query("ROLLBACK"); return null; }
      const orig = origRows[0];

      const { rows: newListRows } = await client.query(
        `INSERT INTO lists (user_id, name, list_type, is_private, passcode_hash)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [userId, `Copy of ${orig.name}`, orig.list_type, orig.is_private, orig.passcode_hash]
      );
      const newList = newListRows[0];

      const { rows: items } = await client.query(
        "SELECT * FROM list_items WHERE list_id = $1 ORDER BY position ASC, id ASC",
        [id]
      );
      for (const item of items) {
        await client.query(
          `INSERT INTO list_items (list_id, title, description, image_data, buy_link, price, priority, quantity, position)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [newList.id, item.title, item.description, item.image_data, item.buy_link, item.price, item.priority, item.quantity, item.position]
        );
      }

      await client.query("COMMIT");
      return newList;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async delete(id, userId) {
    const { rowCount } = await pool.query(
      "DELETE FROM lists WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return rowCount > 0;
  }
}
