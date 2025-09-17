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
  // Add retry configuration
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Add error handlers for the pool
db.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
  // Don't exit the process, just log the error
});

db.on("connect", (client) => {
  console.log("🔗 New client connected to PostgreSQL");

  // Handle client errors
  client.on("error", (err) => {
    console.error("❌ PostgreSQL client error:", err);
  });
});

db.on("acquire", () => {
  console.log("📥 Client acquired from pool");
});

db.on("release", (err) => {
  if (err) {
    console.error("❌ Error releasing client back to pool:", err);
  } else {
    console.log("📤 Client released back to pool");
  }
});

// Function to initialize database tables
async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database tables...");

    // Create users table
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

    // Create session table for express-session store
    await db.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `);

    await db
      .query(
        `
      ALTER TABLE "session" ADD CONSTRAINT "session_pkey" 
      PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
    `
      )
      .catch(() => {}); // Ignore error if constraint already exists

    await db.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);

    console.log("✅ Ensured session table exists");
    console.log("✅ Database initialization completed");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

// Database query wrapper with error handling
export async function safeQuery(text: string, params?: any[]) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await db.query(text, params);
    } catch (error: any) {
      lastError = error;
      console.error(
        `❌ Database query attempt ${attempt} failed:`,
        error.message
      );

      // If it's a connection error, wait before retry
      if (
        error.code === "ECONNRESET" ||
        error.code === "ENOTFOUND" ||
        error.message.includes("Connection terminated")
      ) {
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      // If it's not a connection error or we've exhausted retries, throw
      throw error;
    }
  }

  throw lastError;
}

// Test database connection and initialize tables
db.connect()
  .then(async (client) => {
    console.log("✅ Connected to PostgreSQL");
    client.release(); // Release the test connection

    // Initialize database tables
    await initializeDatabase();
  })
  .catch((err) => {
    console.error("❌ PostgreSQL connection error:", err);
    process.exit(1);
  });

// --- Express app ---
const app = express();

// Trust proxy in production (important for cookies and HTTPS)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

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
        "https://floatchat.upayan.dev", // Production frontend
        "https://www.floatchat.upayan.dev", // Production frontend with www
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("[CORS] Blocked origin:", origin);
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
    // Add these for production compatibility
    preflightContinue: false,
    optionsSuccessStatus: 200,
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
      createTableIfMissing: true,
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
      // Set domain for cross-subdomain cookies in production
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN || ".upayan.dev"
          : undefined,
    },
    name: "connect.sid",
    // Trust proxy in production for proper cookie handling
    proxy: process.env.NODE_ENV === "production",
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

// Only apply CSRF to mutating requests (but skip auth routes)
app.use((req, res, next) => {
  if (
    req.method === "GET" ||
    req.method === "HEAD" ||
    req.path === "/api/csrf-token" ||
    req.path.startsWith("/api/auth")
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

app.get("/health", async (_req: Request, res: Response) => {
  const health = {
    status: "ok",
    timestamp: new Date(),
    services: {
      database: "unknown",
      api: "ok",
    },
  };

  try {
    // Test database connectivity
    const client = await db.connect();
    await client.query("SELECT 1");
    client.release();
    health.services.database = "ok";
  } catch (error) {
    console.error("Health check database error:", error);
    health.services.database = "error";
    health.status = "degraded";
  }

  const statusCode = health.status === "ok" ? 200 : 503;
  res.status(statusCode).json(health);
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
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// --- Graceful shutdown handling ---
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

  server.close(() => {
    console.log("🔄 HTTP server closed.");

    // Close database connections
    db.end(() => {
      console.log("📦 PostgreSQL pool has ended.");
      process.exit(0);
    });
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error(
      "❌ Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 30000);
};

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});
