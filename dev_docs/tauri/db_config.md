# Configure ORM compatible with Tauri

`cargo install sea-orm-cli`

# Create database and tables at startup

1. Create a `schema.sql` file.

`src-tauri/schema.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);
```

2. Execute `schema.sql` dynamically in `main.rs`

`src-tauri/src/main.rs`

```sql
use rusqlite::{Connection, Result};
use std::fs;

fn init_db() -> Result<()> {
    let conn = Connection::open("src-tauri/database.db")?;

    // Read the schema.sql file
    let sql_script = fs::read_to_string("src-tauri/schema.sql")
        .expect("Failed to read schema.sql");

    // Execute the SQL script
    conn.execute_batch(&sql_script)?;

    Ok(())
}

fn main() {
    init_db().expect("Failed to initialize database");

    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
```

3. Run command `cargo run` to update or automatically create database.db with all the necessary tables.

# Installing `russqlite`

`cargo add rusqlite --features bundled`

The --features bundled flag ensures that SQLite is included statically, so your app works on any system without requiring SQLite to be installed separately.
