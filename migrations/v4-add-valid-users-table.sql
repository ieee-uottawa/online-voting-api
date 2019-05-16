CREATE TABLE valid_users (
    id    SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE
);