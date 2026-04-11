const express = require("express");
const sqlite3 = require ("sqlite3").verbose();
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads")); 

// Ensure uploads folder exists
if (!fs.existsSync("./uploads")) fs.mkdirSync("./uploads");

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// Database setup
if (!fs.existsSync("./database")) fs.mkdirSync("./database");
const db = new sqlite3.Database("./database/timeline.db");
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
});

// --- LOGIN ROUTE ---
const users = { lisel: "mypassword123", tatenda: "ourmemories" };

app.post("/login", (req, res) => {
  const username = req.body.username?.trim();
  const password = req.body.password?.trim();

  console.log("LOGIN ATTEMPT:", { username, password });

  if (users[username] && users[username] === password) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// --- MEMORY ROUTES ---
app.get("/memories", (req, res) => {
  db.all("SELECT * FROM memories ORDER BY date DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/memories", upload.single("image"), (req, res) => {
  const { title, description, date } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    "INSERT INTO memories (title, description, date, image) VALUES (?, ?, ?, ?)",
    [title, description, date, image],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.put("/memories/:id", (req, res) => {
  const { title, description, date } = req.body;
  db.run(
    "UPDATE memories SET title=?, description=?, date=? WHERE id=?",
    [title, description, date, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Updated" });
    }
  );
});

app.delete("/memories/:id", (req, res) => {
  db.run("DELETE FROM memories WHERE id=?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted" });
  });
});

// --- SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));