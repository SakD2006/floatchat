import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { config } from "./config";
import session from "express-session";
import pgSession from "connect-pg-simple";
import passport from "./passport";
import { Pool } from "pg";
import apiRoutes from "./routes";
import csurf from "csurf";

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
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
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

// --- Security & parsing middleware ---
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl/mobile apps)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        config.frontendUrl,
        "http://localhost:3000",
        "https://localhost:3000",
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-csrf-token",
      "Cache-Control",
    ],
    exposedHeaders: ["set-cookie"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(cookieParser());

// --- Session & Passport ---
const PgStore = pgSession(session);

app.use(
  session({
    store: new PgStore({
      pool: db,
      tableName: "session",
    }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true, // reset expiration on activity
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      domain: process.env.NODE_ENV === "production" ? ".upayan.dev" : undefined,
    },
    name: "connect.sid",
  })
);

// --- Debug session middleware ---
app.use((req, _res, next) => {
  console.log("[SESSION DEBUG] Session ID:", req.sessionID);
  console.log("[SESSION DEBUG] Session data:", req.session);
  console.log(
    "[SESSION DEBUG] Is authenticated:",
    req.isAuthenticated ? req.isAuthenticated() : false
  );
  next();
});

// --- CSRF Protection ---
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
});

// Only apply CSRF to mutating requests
app.use((req, res, next) => {
  if (
    req.method === "GET" ||
    req.method === "HEAD" ||
    req.path === "/api/csrf-token"
  ) {
    return next();
  }
  return csrfProtection(req, res, next);
});

app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to FloatChat API!", status: "ok" });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

app.get("/api/csrf-token", csrfProtection, (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use("/api", apiRoutes);

// --- 404 handler ---
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// --- Error handler ---
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
