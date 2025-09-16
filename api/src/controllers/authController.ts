import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { config } from "../config";
import { createUser, findUserByEmail, validatePassword } from "../models/user";

export const loginController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "local",
    (
      err: Error | null,
      user: Express.User | false,
      info: { message?: string } | undefined
    ) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: info?.message });
      req.logIn(user, (err: Error | null) => {
        if (err) return next(err);
        res.json({ user });
      });
    }
  )(req, res, next);
};

// Registration controller
export const registerController = async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    // Check if user exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }
    // Create user
    const user = await createUser(name, username, email, password);
    if (!user) {
      return res.status(500).json({ error: "User creation failed" });
    }

    // Auto-login the user after successful registration
    req.login(user, (err: Error | null) => {
      if (err) {
        console.error("Auto-login error after registration:", err);
        // Return user data even if auto-login fails
        return res.status(201).json({
          message: "User registered successfully, but auto-login failed",
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
          },
        });
      }

      console.log("[REGISTER] Session after registration:", req.session);
      req.session.save(() => {
        res.status(201).json({
          message: "User registered and logged in successfully",
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
          },
        });
      });
    });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login controller (local)
export const localLoginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const valid = await validatePassword(user, password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    req.login(user, (err: Error | null) => {
      if (err) {
        console.error("Session error:", err);
        return res.status(500).json({ error: "Session error" });
      }
      console.log("[LOGIN] Session after login:", req.session);
      req.session.save(() => {
        const setCookie = res.getHeader("Set-Cookie");
        console.log("[LOGIN] Set-Cookie header:", setCookie);
        res.json({
          message: "Login successful",
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
          },
        });
      });
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const googleCallbackController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "google",
    (
      err: Error | null,
      user: Express.User | false,
      info: { message?: string } | undefined
    ) => {
      if (err) return next(err);
      if (!user) return res.redirect("/login?error=google");
      req.logIn(user, (err: Error | null) => {
        if (err) return next(err);
        res.redirect(config.frontendUrl || "/");
      });
    }
  )(req, res, next);
};

export const logoutController = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ error: "Session destroy failed" });
      }

      // Clear cookies with same settings as session
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      // Also clear CSRF cookie if it exists
      res.clearCookie("_csrf", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      res.json({ message: "Logged out successfully" });
    });
  });
};

export const meController = (req: Request, res: Response) => {
  console.log("[ME] Session:", req.session);
  console.log("[ME] User:", req.user);
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const { id, name, username, email } = req.user as any;
  res.json({ user: { id, name, username, email } });
};
