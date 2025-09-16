import { Router } from "express";
import passport from "passport";
import {
  loginController,
  googleCallbackController,
  logoutController,
  meController,
  registerController,
  localLoginController,
} from "../controllers/authController";

const router = Router();

// Registration
router.post("/register", registerController);

// Local login (custom)
router.post("/login", localLoginController);

// Google OAuth2
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/google/callback", googleCallbackController);

// Logout
router.post("/logout", logoutController);

// Get current user
router.get("/profile", meController);

// Debug endpoint to check session and cookies
router.get("/debug", (req, res) => {
  console.log("[DEBUG] Headers:", req.headers);
  console.log("[DEBUG] Cookies:", req.cookies);
  console.log("[DEBUG] Session:", req.session);
  console.log("[DEBUG] Session ID:", req.sessionID);
  console.log("[DEBUG] User:", req.user);
  console.log(
    "[DEBUG] Is authenticated:",
    req.isAuthenticated ? req.isAuthenticated() : false
  );

  res.json({
    headers: req.headers,
    cookies: req.cookies,
    sessionId: req.sessionID,
    session: req.session,
    user: req.user,
    isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
    environment: process.env.NODE_ENV,
    cookieSettings: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN || ".upayan.dev"
          : undefined,
    },
  });
});

export default router;
