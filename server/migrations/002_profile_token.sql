ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_token UUID DEFAULT gen_random_uuid();
UPDATE users SET profile_token = gen_random_uuid() WHERE profile_token IS NULL;
ALTER TABLE users ALTER COLUMN profile_token SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_profile_token ON users(profile_token);
