import pg from "pg";

const { Pool } = pg;

export function createDatabase(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  return {
    async initialize() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS contacts (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(40) NOT NULL,
          email VARCHAR(160) NOT NULL DEFAULT '',
          company VARCHAR(120) NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
    },
    async list(search = "") {
      const term = `%${search}%`;
      const result = await pool.query(
        `SELECT * FROM contacts
         WHERE $1 = '' OR name ILIKE $2 OR phone ILIKE $2 OR email ILIKE $2 OR company ILIKE $2
         ORDER BY updated_at DESC, id DESC`,
        [search, term],
      );
      return result.rows;
    },
    async get(id) {
      const result = await pool.query("SELECT * FROM contacts WHERE id = $1", [id]);
      return result.rows[0] ?? null;
    },
    async create(contact) {
      const result = await pool.query(
        `INSERT INTO contacts (name, phone, email, company, notes)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [contact.name, contact.phone, contact.email, contact.company, contact.notes],
      );
      return result.rows[0];
    },
    async update(id, contact) {
      const result = await pool.query(
        `UPDATE contacts SET name = $1, phone = $2, email = $3, company = $4, notes = $5, updated_at = NOW()
         WHERE id = $6 RETURNING *`,
        [contact.name, contact.phone, contact.email, contact.company, contact.notes, id],
      );
      return result.rows[0] ?? null;
    },
    async remove(id) {
      const result = await pool.query("DELETE FROM contacts WHERE id = $1 RETURNING id", [id]);
      return Boolean(result.rowCount);
    },
    async close() {
      await pool.end();
    },
  };
}
