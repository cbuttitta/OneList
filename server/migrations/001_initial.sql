-- Initial schema
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lists (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  share_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  list_type VARCHAR(20),
  is_private BOOLEAN DEFAULT FALSE NOT NULL,
  passcode_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_lists_share_token ON lists(share_token);

CREATE TABLE IF NOT EXISTS list_items (
  id SERIAL PRIMARY KEY,
  list_id INT REFERENCES lists(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  image_data TEXT,
  buy_link TEXT,
  price TEXT
);
