import { Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../types/auth.types";

export const getUsers = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        id,
        name,
        email,
        role,
        is_active,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      users: rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not retrieve users",
    });
  }
};
