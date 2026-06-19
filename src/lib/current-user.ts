import { prisma } from "@/lib/prisma";

export async function getCurrentUser(
  authUserId: string
) {
  return prisma.user.findFirst({
    where: {
      authUserId
    }
  });
}