import { PrismaClient } from "@prisma/client";

export async function generateItineraryForToday(prisma: PrismaClient, userId: string) {
  const scan = await prisma.sensetScan.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  if (!scan) throw new Error("No senset scan for user");

  const exercises = await prisma.exercise.findMany({
    where: { targetSensets: { has: scan.category } },
    orderBy: { durationMin: "asc" }
  });

  const chosen = exercises.slice(0, 3);

  const itinerary = await prisma.sessionItinerary.create({
    data: {
      userId,
      sensetId: scan.id,
      exercises: {
        create: chosen.map((ex) => ({
          exerciseId: ex.id
        }))
      }
    },
    include: {
      exercises: { include: { exercise: true } }
    }
  });

  return itinerary;
}
