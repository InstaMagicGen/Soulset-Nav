import { Router } from "express";
import { authRequired } from "../middleware/auth";
import { computeSensetCategory, computeGlobalScore } from "../services/sensetService";

const router = Router();

/* ---------------------- EXISTANT : /scan ---------------------- */
router.post("/scan", authRequired, async (req, res) => {
  const { energyScore, emotionScore, note } = req.body;

  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  if (typeof energyScore !== "number" || typeof emotionScore !== "number") {
    return res.status(400).json({ error: "Invalid scores" });
  }

  const category = computeSensetCategory(energyScore, emotionScore);
  const globalScore = computeGlobalScore(energyScore, emotionScore);

  const scan = await req.prisma.sensetScan.create({
    data: {
      userId: req.userId,
      energyScore,
      emotionScore,
      note: note || "",
      category,
      globalScore,
    },
  });

  res.json({ scan });
});

/* ---------------------- EXISTANT : /today ---------------------- */
router.get("/today", authRequired, async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const scan = await req.prisma.sensetScan.findFirst({
    where: {
      userId: req.userId,
      createdAt: { gte: start, lte: end },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ scan });
});


/* ---------------------- NOUVEAU : /analyze ---------------------- */
/* ⚠️ PAS DE authRequired pour permettre au frontend public d’appeler l’API */
router.post("/analyze", async (req, res) => {
  try {
    const { text, mode, lang, liveDialogue } = req.body ?? {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'text' field" });
    }

    // Placeholder : logique de génération interne avant OpenAI
    const trimmed = text.length > 300 ? text.slice(0, 300) + "..." : text;

    const insights = `Analyse (${mode || "quick"} | ${lang || "fr"}) : ${trimmed}`;

    const actions = [
      "Clarifie ton intention principale.",
      "Identifie ce qui dépend réellement de toi.",
      "Choisis une micro-action réalisable dans les 10 prochaines minutes.",
    ];

    const soulsetRest =
      "Respire profondément. Tu n’as pas à résoudre toute ta vie maintenant. Avance à ton rythme.";

    return res.json({
      insights,
      actions,
      soulsetRest,
      liveDialogue: !!liveDialogue,
    });

  } catch (err) {
    console.error("Analyze error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


/* ---------------------- EXPORT ---------------------- */
export default router;
