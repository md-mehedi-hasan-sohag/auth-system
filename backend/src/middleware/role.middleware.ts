import { Response, NextFunction } from "express";
import { AuthRequest, UserRole } from "../types/auth.types";
import { getUserById } from "../services/auth.service";

// Re-reads the role from the database so a demoted or disabled
// admin loses access immediately instead of when their JWT expires.
export const requireRole =
  (...allowedRoles: UserRole[]) =>
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    try {
      const user = await getUserById(req.user.id);

      if (!user) {
        res.status(401).json({
          success: false,
          message: "User no longer exists or is disabled",
        });
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission",
        });
        return;
      }

      req.user = { id: user.id, email: user.email, role: user.role };
      next();
    } catch (error) {
      next(error);
    }
  };