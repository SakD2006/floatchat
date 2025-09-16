import { Router } from "express";
import passport from "passport";
import {
  loginController,
  googleCallbackController,
  logoutController,
  meController,
} from "../controllers/authController";

const router = Router();

// Local login
router.post("/login", loginController);

// Google OAuth2
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/google/callback", googleCallbackController);

// Logout
router.post("/logout", logoutController);

// Get current user
router.get("/me", meController);

export default router;
