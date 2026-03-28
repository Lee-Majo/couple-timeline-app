const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Ensure database folder exists
if (!fs.existsSync("./database")) {
  fs.mkdirSync("./database");
}

const db = new sqlite3.Database("./database/timeline.db");

// Create table + insert demo data ONLY if empty
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      date TEXT,
      image TEXT
    )
  `);

  // Check if table is empty
  db.get("SELECT COUNT(*) as count FROM memories", (err, row) => {
    if (row.count === 0) {
      db.run(`INSERT INTO memories (title, description, date, image) VALUES 
        ('First Date 💕', 'We went out and laughed the whole night', '2024-01-10', null),
        ('Movie Night 🍿', 'Watched our favorite movie together', '2024-02-14', null),
        ('Beach Day 🌊', 'Spent the day at the beach, best vibes ever', '2024-03-05', null)
      `);
    }
  });
});


// ✅ GET (allowed)
app.get("/memories", (req, res) => {
  db.all("SELECT * FROM memories ORDER BY date DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// ❌ BLOCK everything else
app.post("/memories", (req, res) => {
  res.status(403).json({ message: "Not allowed" });
});

app.delete("/memories/:id", (req, res) => {
  res.status(403).json({ message: "Not allowed" });
});

app.put("/memories/:id", (req, res) => {
  res.status(403).json({ message: "Not allowed" });
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});