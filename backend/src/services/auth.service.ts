import bcrypt from "bcryptjs";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { UserRole } from "../types/auth.types";

interface DatabaseUser extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: number;
}

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  const normalizedEmail = email.toLowerCase().trim();

  const [existingUsers] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ?",
    [normalizedEmail]
  );

  if (existingUsers.length > 0) {
    throw new Error("EMAIL_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO users
        (name, email, password_hash, role)
      VALUES
        (?, ?, ?, 'USER')
      `,
      [name.trim(), normalizedEmail, passwordHash]
    );

    return {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail,
      role: "USER" as UserRole,
    };
  } catch (error: any) {
    // Two concurrent registrations can both pass the SELECT above
    if (error?.code === "ER_DUP_ENTRY") {
      throw new Error("EMAIL_EXISTS");
    }
    throw error;
  }
};

export const authenticateUser = async (
  email: string,
  password: string
) => {
  const normalizedEmail = email.toLowerCase().trim();

  const [users] = await pool.execute<DatabaseUser[]>(
    `
    SELECT
      id,
      name,
      email,
      password_hash,
      role,
      is_active
    FROM users
    WHERE email = ?
    LIMIT 1
    `,
    [normalizedEmail]
  );

  if (users.length === 0) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const user = users[0];

  const passwordValid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Checked after the password so disabled status is not revealed to guessers
  if (!user.is_active) {
    throw new Error("ACCOUNT_DISABLED");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const getUserById = async (id: number) => {
  const [users] = await pool.execute<DatabaseUser[]>(
    `
    SELECT
      id,
      name,
      email,
      role,
      is_active
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  if (users.length === 0) {
    return null;
  }

  const user = users[0];

  if (!user.is_active) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};
