import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import {
  authRoutes,
  movieRoutes,
  tvRoutes,
  searchRoutes,
  healthRoutes,
} from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const staticPath = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
}

let isDBConnected = false;
let dbConnectionPromise = null;

const ensureDB = async (req, res, next) => {
  if (req.path === "/api/test") return next();

  if (!isDBConnected) {
    if (!dbConnectionPromise) {
      dbConnectionPromise = connectDB()
        .then(() => {
          isDBConnected = true;
          console.log("DB Connected");
        })
        .catch((err) => {
          console.error("DB Error:", err.message);
          dbConnectionPromise = null;
        });
    }

    try {
      await Promise.race([
        dbConnectionPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 10000),
        ),
      ]);
    } catch (err) {
      return res
        .status(503)
        .json({ success: false, message: "Database timeout" });
    }
  }
  next();
};

app.use("/api", ensureDB);

app.get("/api/test", (req, res) =>
  res.json({
    status: "API is up",
    dbConnected: isDBConnected,
  }),
);

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/movie", movieRoutes);
app.use("/api/v1/tv", tvRoutes);
app.use("/api/v1/search", searchRoutes);

// ✅ FIXED: Catch-all using app.use() instead of app.get("*", ...)
app.use((req, res) => {
  if (req.url.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  if (fs.existsSync(staticPath)) {
    res.sendFile(path.join(staticPath, "index.html"));
  } else {
    res.status(404).send("Not found");
  }
});

connectDB()
  .then(() => (isDBConnected = true))
  .catch(console.error);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () =>
    console.log(`Server on port http://localhost:${PORT}`),
  );
}

export default app;
