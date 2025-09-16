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

export default router;
