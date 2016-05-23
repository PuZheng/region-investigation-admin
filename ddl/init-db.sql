CREATE TABLE version (
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL UNIQUE,
    path TEXT NOT NULL,
    brief TEXT,
    created_at TEXT NOT NULL
);
