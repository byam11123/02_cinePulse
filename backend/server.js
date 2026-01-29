import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";

// Safe imports with error handling
let authRoutes, movieRoutes, tvRoutes, searchRoutes, healthRoutes;
try {
  const routes = await import("./routes/index.js");
  authRoutes = routes.authRoutes;
  movieRoutes = routes.movieRoutes;
  tvRoutes = routes.tvRoutes;
  searchRoutes = routes.searchRoutes;
  healthRoutes = routes.healthRoutes;
} catch (e) {
  console.error("Routes import error:", e.message);
}

// Load env vars
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Essential middleware
app.use(express.json());
app.use(cookieParser());

// CORS for Vercel
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Health check FIRST (so we know if server is up)
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API working", path: __dirname });
});

// API Routes (only if imports succeeded)
if (authRoutes) app.use("/api/v1/auth", authRoutes);
if (healthRoutes) app.use("/api/v1/health", healthRoutes);

// Static files - check multiple possible paths
const possiblePaths = [
  path.join(__dirname, "..", "frontend", "dist"),
  path.join(__dirname, "..", "..", "frontend", "dist"),
  path.join(process.cwd(), "frontend", "dist"),
  "/var/task/frontend/dist"  // Vercel sometimes uses this
];

let staticPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    staticPath = p;
    console.log("Found frontend at:", p);
    break;
  }
}

if (staticPath) {
  app.use(express.static(staticPath));
  app.get("*", (req, res, next) => {
    if (req.url.startsWith("/api/")) return next();
    res.sendFile(path.join(staticPath, "index.html"));
  });
} else {
  console.log("Frontend dist not found, serving API only");
  app.get("/", (req, res) => res.json({
    message: "API Server Running",
    pathsChecked: possiblePaths,
    cwd: process.cwd(),
    dirname: __dirname
  }));
}

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message });
});

// Connect DB (but don't crash if it fails)
let dbConnected = false;
connectDB()
  .then(() => { dbConnected = true; console.log("DB Connected"); })
  .catch(err => console.error("DB Connection Error:", err.message));

// Export for Vercel
export default app;

// Local dev only
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Local server on port ${PORT}`));
}