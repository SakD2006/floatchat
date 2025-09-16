import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "./server";
import { config } from "./config";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  console.log("[PASSPORT] deserializeUser called with id:", id);
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    console.log("[PASSPORT] DB result:", result.rows);
    done(null, result.rows[0]);
  } catch (err) {
    console.error("[PASSPORT] deserializeUser error:", err);
    done(err, null);
  }
});

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          email,
        ]);
        const user = result.rows[0];
        if (!user) return done(null, false, { message: "Incorrect email." });
        // Use bcrypt to compare password
        const bcrypt = require("bcrypt");
        if (!(await bcrypt.compare(password, user.password_hash)))
          return done(null, false, { message: "Incorrect password." });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId!,
      clientSecret: config.google.clientSecret!,
      callbackURL: config.google.callbackUrl!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        let result = await db.query("SELECT * FROM users WHERE email = $1", [
          email,
        ]);
        let user = result.rows[0];
        if (!user) {
          // Create user if doesn't exist
          // Use displayName for both name and username
          result = await db.query(
            "INSERT INTO users (name, username, email, password_hash, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
            [profile.displayName, profile.displayName, email, ""]
          );
          user = result.rows[0];
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
