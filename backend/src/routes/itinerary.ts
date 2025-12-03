import { Router } from "express";
import { authRequired } from "../middleware/auth";
import { generateItineraryForToday } from "../services/itineraryService";

const router = Router();

router.post("/generate", authRequired, async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const itinerary = await generateItineraryForToday(req.prisma, req.userId);
    res.json({ itinerary });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Could not generate itinerary" });
  }
});

export default router;
