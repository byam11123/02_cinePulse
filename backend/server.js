import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";

// Import routes
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Fix 1: Trust proxy for rate limiter (Vercel uses proxies)
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ✅ Fix 2: Health check FIRST (no DB needed)
app.get("/api/test", (req, res) => {
  res.json({
    message: "API working",
    dbStatus: isConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Static files FIRST (before API routes that might crash)
const staticPath = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
}

// ✅ Fix 3: DB Connection Middleware - Blocks requests until DB is ready
let isConnected = false;
let dbConnectionPromise = null;

const ensureDbConnected = async (req, res, next) => {
  // Skip for health checks and static files
  if (req.path === "/api/test" || req.path === "/api/health") {
    return next();
  }

  // If not connected, try to connect
  if (!isConnected) {
    if (!dbConnectionPromise) {
      dbConnectionPromise = connectDB()
        .then(() => {
          isConnected = true;
          console.log("MongoDB Connected");
        })
        .catch((err) => {
          console.error("MongoDB Connection Error:", err.message);
          dbConnectionPromise = null;
          throw err;
        });
    }

    try {
      await dbConnectionPromise;
    } catch (err) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable. Please try again later.",
      });
    }
  }
  next();
};

// Apply DB middleware to all API routes
app.use("/api", ensureDbConnected);

// API Routes
if (healthRoutes) app.use("/api/v1/health", healthRoutes);
if (authRoutes) app.use("/api/v1/auth", authRoutes);
if (movieRoutes) app.use("/api/v1/movie", movieRoutes);
if (tvRoutes) app.use("/api/v1/tv", tvRoutes);
if (searchRoutes) app.use("/api/v1/search", searchRoutes);

// ✅ Fix 4: SPA Catch-all (AFTER API routes)
if (fs.existsSync(staticPath)) {
  app.use((req, res, next) => {
    // Skip API routes
    if (req.url.startsWith("/api/")) {
      return next();
    }
    // Serve index.html for everything else
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

// 404 for API routes
app.use((req, res) => {
  if (req.url.startsWith("/api/")) {
    res.status(404).json({ success: false, message: "API endpoint not found" });
  } else {
    res.status(404).send("Not found");
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message });
});

// Start DB connection in background
connectDB()
  .then(() => {
    isConnected = true;
    console.log("Initial DB Connection Successful");
  })
  .catch((err) => console.error("Initial DB Connection Failed:", err.message));

// Local dev only
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}

export default app;
