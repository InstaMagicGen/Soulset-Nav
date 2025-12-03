import { Router } from "express";
import bcrypt from "bcryptjs";
import { signToken } from "../middleware/auth";

const router = Router();

router.post("/signup", async (req, res) => {
  const { email, password, preferredLang } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Missing email or password" });

  const existing = await req.prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "User exists" });

  const hash = await bcrypt.hash(password, 10);
  const user = await req.prisma.user.create({
    data: {
      email,
      passwordHash: hash,
      preferredLang: preferredLang || "en"
    }
  });

  const token = signToken(user.id);
  res.json({
    token,
    user: { id: user.id, email: user.email, preferredLang: user.preferredLang }
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await req.prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user.id);
  res.json({
    token,
    user: { id: user.id, email: user.email, preferredLang: user.preferredLang }
  });
});

export default router;
