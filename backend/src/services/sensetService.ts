import { SensetCategory } from "@prisma/client";

export function computeSensetCategory(energy: number, emotion: number): SensetCategory {
  if (energy < 2 && emotion > 3) return "OVERWHELM";
  if (energy < 2 && emotion <= 3) return "EMPTY";
  if (energy > 3 && emotion > 3) return "AGITATED";
  if (energy >= 2 && energy <= 3 && emotion > 3) return "ANXIOUS";
  return "BALANCED";
}

export function computeGlobalScore(energy: number, emotion: number): number {
  return Math.max(0, Math.min(100, (5 - energy + emotion) * 10));
}
