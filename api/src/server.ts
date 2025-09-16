import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import session from "express-session";
import passport from "./passport";
import { Pool } from "pg";
import apiRoutes from "./routes";

const PORT = config.port;

// --- PostgreSQL connection ---
export const db = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

db.connect()
  .then(async () => {
    console.log("✅ Connected to PostgreSQL");
    // Create users table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Ensured users table exists");
  })
  .catch((err) => {
    console.error("❌ PostgreSQL connection error:", err);
    process.exit(1);
  });

// --- Express app ---
const app = express();

// --- Middleware ---
app.use(helmet()); // security headers
app.use(cors({ origin: config.frontendUrl || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

// --- Session & Passport ---
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set secure: true if using HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---

// Default root route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to FloatChat API!", status: "ok" });
});

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// API routes
app.use("/api", apiRoutes);

// --- 404 handler ---
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// --- Error handler ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
