import "dotenv/config";
import express from "express";
import cors from "cors";
import { json } from "body-parser";
import { PrismaClient } from "@prisma/client";
import authRouter from "./routes/auth";
import sensetRouter from "./routes/senset";
import itineraryRouter from "./routes/itinerary";
import journalRouter from "./routes/journal";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(json());

declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient;
      userId?: string;
    }
  }
}

app.use((req, _res, next) => {
  req.prisma = prisma;
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/senset", sensetRouter);
app.use("/itinerary", itineraryRouter);
app.use("/journal", journalRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Soulset Navigator backend listening on ${PORT}`);
});
