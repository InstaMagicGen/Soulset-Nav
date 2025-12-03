import { Router } from "express";
import { authRequired } from "../middleware/auth";

const router = Router();

router.post("/", authRequired, async (req, res) => {
  const { text, sessionItineraryId, moodAfter } = req.body;
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
  if (!text) return res.status(400).json({ error: "Missing text" });

  const entry = await req.prisma.journalEntry.create({
    data: {
      userId: req.userId,
      sessionItineraryId: sessionItineraryId || null,
      rawText: text,
      moodAfter: typeof moodAfter === "number" ? moodAfter : null
    }
  });

  res.json({ entry });
});

router.get("/history", authRequired, async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const entries = await req.prisma.journalEntry.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    take: 30
  });

  res.json({ entries });
});

export default router;
