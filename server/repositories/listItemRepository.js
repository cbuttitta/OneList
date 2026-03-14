import pool from "../db.js";

export class ListItemRepository {
  async findAllByList(listId) {
    const { rows } = await pool.query(
      "SELECT * FROM list_items WHERE list_id = $1 ORDER BY id",
      [listId]
    );
    return rows;
  }

  async create({ listId, title, description, status, due_date }) {
    const { rows } = await pool.query(
      `INSERT INTO list_items (list_id, title, description, status, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [listId, title, description, status || "pending", due_date || null]
    );
    return rows[0];
  }

  async update(itemId, listId, { title, description, status, due_date }) {
    const { rows } = await pool.query(
      `UPDATE list_items SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         due_date = COALESCE($4, due_date)
       WHERE id = $5 AND list_id = $6
       RETURNING *`,
      [title, description, status, due_date, itemId, listId]
    );
    return rows[0] || null;
  }

  async delete(itemId, listId) {
    const { rowCount } = await pool.query(
      "DELETE FROM list_items WHERE id = $1 AND list_id = $2",
      [itemId, listId]
    );
    return rowCount > 0;
  }
}
