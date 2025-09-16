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

// --- Middleware ---
app.use(helmet()); // security headers

// Enhanced CORS configuration for cross-origin cookies
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
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
app.use(cookieParser()); // Required for csurf with cookie option

// --- Session & Passport ---
app.use((req, res, next) => {
  // Log incoming cookies and session before session middleware
  console.log("[SESSION MIDDLEWARE] Incoming cookies:", req.headers.cookie);
  // Allow /api/csrf-token and /api/auth/register and /api/auth/login without session cookie
  const publicPaths = [
    "/api/csrf-token",
    "/api/auth/register",
    "/api/auth/login",
  ];
  if (publicPaths.includes(req.path)) {
    return next();
  }
  // Only allow connect.sid for authentication on protected endpoints
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(";").map((c) => c.trim());
    const connectSid = cookies.find((c) => c.startsWith("connect.sid="));
    if (!connectSid) {
      console.warn(
        "[SESSION MIDDLEWARE] No connect.sid cookie found. Rejecting request."
      );
      return res.status(401).json({ error: "Session cookie missing" });
    }
    if (cookies.length > 1) {
      console.warn(
        "[SESSION MIDDLEWARE] Multiple session cookies found:",
        cookies
      );
    }
  }
  next();
});
// Configure session with proper cookie settings
app.use(
  session({
    store: new (pgSession(session))({
      pool: db,
      tableName: "session",
    }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on activity
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      domain: process.env.NODE_ENV === "production" ? undefined : undefined, // Let browser handle domain
    },
    name: "connect.sid",
  })
);

// Session debugging middleware (after session is initialized)
app.use((req, res, next) => {
  console.log("[SESSION DEBUG] Session ID:", req.sessionID);
  console.log("[SESSION DEBUG] Session data:", req.session);
  console.log(
    "[SESSION DEBUG] Is authenticated:",
    req.isAuthenticated ? req.isAuthenticated() : false
  );
  next();
});
// --- CSRF Protection ---
import csurf from "csurf";
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
});

// Only apply CSRF protection to mutating requests
app.use((req, res, next) => {
  // Exclude safe methods and CSRF token route
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

// Default root route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to FloatChat API!", status: "ok" });
});

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// --- Send CSRF token to frontend ---
app.get("/api/csrf-token", csrfProtection, (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken() });
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
