ALTER TABLE candidates
  RENAME COLUMN platform TO platform_en;

ALTER TABLE candidates
  ALTER COLUMN platform_en DROP NOT NULL;

ALTER TABLE candidates
  ADD platform_fr TEXT;