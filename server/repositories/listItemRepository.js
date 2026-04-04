import pool from "../db.js";

export class ListItemRepository {
  async findAllByList(listId) {
    const { rows } = await pool.query(
      "SELECT * FROM list_items WHERE list_id = $1 ORDER BY position ASC, id ASC",
      [listId]
    );
    return rows;
  }

  async create({ listId, title, description, status, image_data, buy_link, price, priority, quantity }) {
    const { rows: maxRows } = await pool.query(
      "SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM list_items WHERE list_id = $1",
      [listId]
    );
    const position = maxRows[0].next_pos;
    const { rows } = await pool.query(
      `INSERT INTO list_items (list_id, title, description, status, image_data, buy_link, price, priority, quantity, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [listId, title, description || null, status || "pending", image_data || null, buy_link || null, price || null, priority || null, quantity || 1, position]
    );
    return rows[0];
  }

  // Partial update — only status (used by owner to manually toggle)
  async update(itemId, listId, { status }) {
    const { rows } = await pool.query(
      `UPDATE list_items SET status = COALESCE($1, status)
       WHERE id = $2 AND list_id = $3 RETURNING *`,
      [status || null, itemId, listId]
    );
    return rows[0] || null;
  }

  // Full edit — replaces all editable fields explicitly (allows clearing)
  async edit(itemId, listId, { title, description, image_data, buy_link, price, priority, quantity }) {
    const { rows } = await pool.query(
      `UPDATE list_items SET
         title = $1,
         description = $2,
         image_data = $3,
         buy_link = $4,
         price = $5,
         priority = $6,
         quantity = $7
       WHERE id = $8 AND list_id = $9 RETURNING *`,
      [title, description || null, image_data || null, buy_link || null, price || null, priority || null, quantity || 1, itemId, listId]
    );
    return rows[0] || null;
  }

  // Claim via share token — updates status and claimer_note
  async claimItem(itemId, listId, { status, claimer_note }) {
    const { rows } = await pool.query(
      `UPDATE list_items SET status = $1, claimer_note = $2
       WHERE id = $3 AND list_id = $4 RETURNING *`,
      [status, claimer_note || null, itemId, listId]
    );
    return rows[0] || null;
  }

  async reorder(itemId, listId, direction) {
    const { rows: items } = await pool.query(
      "SELECT * FROM list_items WHERE list_id = $1 ORDER BY position ASC, id ASC",
      [listId]
    );
    const idx = items.findIndex((i) => i.id === parseInt(itemId));
    if (idx === -1) return null;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return null;

    const a = items[idx];
    const b = items[swapIdx];
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("UPDATE list_items SET position = $1 WHERE id = $2", [b.position, a.id]);
      await client.query("UPDATE list_items SET position = $1 WHERE id = $2", [a.position, b.id]);
      await client.query("COMMIT");
      return items.map((item) => {
        if (item.id === a.id) return { ...item, position: b.position };
        if (item.id === b.id) return { ...item, position: a.position };
        return item;
      }).sort((x, y) => x.position - y.position || x.id - y.id);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async delete(itemId, listId) {
    const { rowCount } = await pool.query(
      "DELETE FROM list_items WHERE id = $1 AND list_id = $2",
      [itemId, listId]
    );
    return rowCount > 0;
  }
}
