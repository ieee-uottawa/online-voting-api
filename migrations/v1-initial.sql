CREATE TABLE positions
(
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE candidates
(
  id          SERIAL PRIMARY KEY,
  name        TEXT    NOT NULL,
  position_id INTEGER NOT NULL,
  platform    TEXT    NOT NULL,
  votes       INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (position_id) REFERENCES positions (id)
);
CREATE TABLE valid_users
(
  id        SERIAL PRIMARY KEY,
  email     TEXT    NOT NULL UNIQUE,
  has_voted BOOLEAN NOT NULL DEFAULT FALSE
);