import { Request } from "express";

export type UserRole = "USER" | "ADMIN";

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
