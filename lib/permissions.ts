import { auth } from "./auth"

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return {
    user: session.user,
    isAdmin: session.user.role === "ADMIN",
  }
}

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden")
  }
  return session.user
}
