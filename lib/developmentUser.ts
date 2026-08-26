import { db } from "@/lib/db";

const developmentUserId = "development-user";

export async function getDevelopmentUser(): Promise<{ id: string }> {
  return db.user.upsert({
    where: { id: developmentUserId },
    update: {},
    create: { id: developmentUserId },
    select: { id: true },
  });
}