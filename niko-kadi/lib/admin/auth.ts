import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma/client";
import { createSession } from "./session";

export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) return { success: false, error: "Invalid credentials" };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { success: false, error: "Invalid credentials" };

  await createSession(user.id, user.username);
  return { success: true };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
