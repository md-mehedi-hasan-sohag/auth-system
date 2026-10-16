import { Request, Response, CookieOptions } from "express";
import { ZodError } from "zod";
import {
  createUser,
  authenticateUser,
  getUserById,
} from "../services/auth.service";
import { generateToken } from "../utils/jwt";
import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator";
import { AuthRequest } from "../types/auth.types";

const isProduction =
  process.env.NODE_ENV === "production";

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

const cookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 24 * 60 * 60 * 1000,
};

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    const user = await createUser(
      data.name,
      data.email,
      data.password
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
    });
  } catch (error: any) {
    if (error?.message === "EMAIL_EXISTS") {
      res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
      return;
    }

    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: error.issues[0]?.message || "Invalid data",
      });
      return;
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await authenticateUser(
      data.email,
      data.password
    );

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie("access_token", token, cookieOptions);

    res.json({
      success: true,
      message: "Login successful",
      user,
    });
  } catch (error: any) {
    if (error?.message === "INVALID_CREDENTIALS") {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    if (error?.message === "ACCOUNT_DISABLED") {
      res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
      return;
    }

    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: error.issues[0]?.message || "Invalid data",
      });
      return;
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (
  _req: Request,
  res: Response
): Promise<void> => {
  res.clearCookie("access_token", baseCookieOptions);

  res.json({
    success: true,
    message: "Logout successful",
  });
};

export const me = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const user = await getUserById(req.user.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User no longer exists or is disabled",
      });
      return;
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
