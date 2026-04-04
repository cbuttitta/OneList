import pool from "../db.js";

export class UserRepository {
  async findByEmail(email) {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const { rows } = await pool.query(
      "SELECT id, name, email, profile_token FROM users WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  }

  async create({ name, email, passwordHash }) {
    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [name, email, passwordHash]
    );
    return rows[0];
  }
}
