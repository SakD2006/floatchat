import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { config } from "../config";

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
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
};

export const meController = (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  res.json({ user: req.user });
};
