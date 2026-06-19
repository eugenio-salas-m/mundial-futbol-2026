import { prisma } from "@/lib/prisma";

export async function isSuperAdmin(
  authUserId: string
) {

  const user = await prisma.user.findFirst({
    where: {
      authUserId
    }
  });

  return user?.role === "super_admin";
}