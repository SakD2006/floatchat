import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "./server";
import { config } from "./config";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, result.rows[0]);
  } catch (err) {
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
        // TODO: Use bcrypt to compare password
        if (user.password !== password)
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
          result = await db.query(
            "INSERT INTO users (email, name, google_id) VALUES ($1, $2, $3) RETURNING *",
            [email, profile.displayName, profile.id]
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
