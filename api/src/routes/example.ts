import { Router, Request, Response } from "express";
import { db } from "../server";

const router = Router();

// GET all example items
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await db.query("SELECT * FROM example_table");
    res.json(result.rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
