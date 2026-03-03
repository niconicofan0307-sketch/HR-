import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    jd TEXT NOT NULL,
    traits TEXT NOT NULL,
    questions TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS interviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    candidate_name TEXT NOT NULL,
    responses TEXT NOT NULL,
    evaluation TEXT,
    score INTEGER,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/jobs", (req, res) => {
    const jobs = db.prepare("SELECT * FROM jobs ORDER BY created_at DESC").all();
    res.json(jobs);
  });

  app.post("/api/jobs", (req, res) => {
    const { title, jd, traits, questions } = req.body;
    const info = db.prepare(
      "INSERT INTO jobs (title, jd, traits, questions) VALUES (?, ?, ?, ?)"
    ).run(title, jd, traits, JSON.stringify(questions));
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/jobs/:id", (req, res) => {
    const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(req.params.id);
    if (job) {
      job.questions = JSON.parse(job.questions);
    }
    res.json(job);
  });

  app.post("/api/interviews", (req, res) => {
    const { job_id, candidate_name, responses, evaluation, score } = req.body;
    const info = db.prepare(
      "INSERT INTO interviews (job_id, candidate_name, responses, evaluation, score) VALUES (?, ?, ?, ?, ?)"
    ).run(job_id, candidate_name, JSON.stringify(responses), evaluation, score);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/interviews/:job_id", (req, res) => {
    const interviews = db.prepare(
      "SELECT * FROM interviews WHERE job_id = ? ORDER BY created_at DESC"
    ).all(req.params.job_id);
    res.json(interviews.map(i => ({
      ...i,
      responses: JSON.parse(i.responses)
    })));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
