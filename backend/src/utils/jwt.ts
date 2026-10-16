import jwt from "jsonwebtoken";
import { AuthUser } from "../types/auth.types";

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
};

export const generateToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    getSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    } as jwt.SignOptions
  );
};

export const verifyToken = (token: string): AuthUser => {
  return jwt.verify(token, getSecret()) as AuthUser;
};
