const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));


const fs = require("fs");

// Create database folder if it doesn't exist
if (!fs.existsSync("./database")) {
  fs.mkdirSync("./database");
}

const db = new sqlite3.Database("./database/timeline.db");

db.run(`
CREATE TABLE IF NOT EXISTS memories (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 title TEXT,
 description TEXT,
 date TEXT,
 image TEXT
)
`);

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

  // Clear existing (so it resets clean)
  db.run("DELETE FROM memories");

  // Insert fake memories
  db.run(`INSERT INTO memories (title, description, date, image) VALUES 
    ('First Date 💕', 'We went out and laughed the whole night', '2024-01-10', null),
    ('Movie Night 🍿', 'Watched our favorite movie together', '2024-02-14', null),
    ('Beach Day 🌊', 'Spent the day at the beach, best vibes ever', '2024-03-05', null)
  `);
});


// ✅ GET (allowed - view only)
app.get("/memories", (req, res) => {
  db.all("SELECT * FROM memories ORDER BY date DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});


// ❌ POST (blocked)
app.post("/memories", (req, res) => {
  res.status(403).json({ message: "Not allowed" });
});


// ❌ DELETE (blocked)
app.delete("/memories/:id", (req, res) => {
  res.status(403).json({ message: "Not allowed" });
});


// ❌ PUT (blocked)
app.put("/memories/:id", (req, res) => {
  res.status(403).json({ message: "Not allowed" });
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});