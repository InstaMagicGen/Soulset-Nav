import { Router } from "express";
import { authRequired } from "../middleware/auth";
import { computeSensetCategory, computeGlobalScore } from "../services/sensetService";

const router = Router();

// --- EXISTANT : scan ---
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
      globalScore
    }
  });

  res.json({ scan });
});

// --- EXISTANT : today ---
router.get("/today", authRequired, async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const scan = await req.prisma.sensetScan.findFirst({
    where: {
      userId: req.userId,
      createdAt: { gte: start, lte: end }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({ scan });
});

// --- NOUVEAU : analyse AI pour Soulset Navigator ---
// ⚠️ PAS d'authRequired pour que ton front public puisse l'appeler
router.post("/analyze", async (req, res) => {
  try {
    const { text, mode, lang, liveDialogue } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'text' field" });
    }

    // Ici pour l'instant : logique simple (placeholder).
    // Ensuite on pourra brancher OpenAI proprement.
    const trimmed = text.length > 300 ? text.slice(0, 300) + "..." : text;

    const insights = `Analyse (${mode || "quick"} | ${lang || "fr"}) : ${trimmed}`;

    const actions = [
      "Note honnêtement ce que tu ressens sans te juger.",
      "Écris une phrase qui résume ce que tu veux vraiment dans cette situation.",
      "Choisis une micro-action réalisable aujourd’hui (moins de 10 minutes)."
    ];

    const soulsetRest =
      "Respire profondément. Tu n’as pas à résoudre toute ta vie maintenant. " +
      "Tu as le droit d’avancer à ton rythme, même si ce rythme est lent.";

    return res.json({
      insights,
      actions,
      soulsetRest,
      liveDialogue: !!liveDialogue
    });
  } catch (err) {
    console.err
