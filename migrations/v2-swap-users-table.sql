CREATE TABLE voted_users
(
  id    SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE
);

INSERT INTO voted_users (id, email)
SELECT id, email
FROM valid_users
WHERE has_voted = TRUE;

DROP TABLE valid_users;