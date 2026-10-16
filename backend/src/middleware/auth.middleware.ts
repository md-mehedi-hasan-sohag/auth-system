import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types";
import { verifyToken } from "../utils/jwt";

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    req.user = verifyToken(token);

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};
