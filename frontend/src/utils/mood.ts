import type { PADState } from '../types';

export interface MoodColor {
  r: number;
  g: number;
  b: number;
}

interface EmotionAnchor {
  name: string;
  p: number;
  a: number;
  d: number;
  color: MoodColor;
}

export const EMOTION_ANCHORS: EmotionAnchor[] = [
  { name: "Boldog", p: 0.8, a: 0.3, d: 0.4, color: { r: 255, g: 215, b: 0 } },
  { name: "Lelkes", p: 0.6, a: 0.8, d: 0.5, color: { r: 255, g: 140, b: 0 } },
  { name: "Izgatott", p: 0.7, a: 0.9, d: 0.2, color: { r: 255, g: 69, b: 0 } },
  { name: "Nyugodt", p: 0.5, a: -0.7, d: 0.3, color: { r: 135, g: 206, b: 235 } },
  { name: "Elégedett", p: 0.8, a: -0.4, d: 0.5, color: { r: 50, g: 205, b: 50 } },
  { name: "Békés", p: 0.6, a: -0.6, d: -0.2, color: { r: 173, g: 216, b: 230 } },
  { name: "Dühös", p: -0.7, a: 0.8, d: 0.6, color: { r: 220, g: 20, b: 60 } },
  { name: "Feszült", p: -0.4, a: 0.7, d: 0.2, color: { r: 255, g: 0, b: 255 } },
  { name: "Szorongó", p: -0.3, a: 0.8, d: -0.6, color: { r: 138, g: 43, b: 226 } },
  { name: "Félénk", p: -0.2, a: 0.3, d: -0.7, color: { r: 112, g: 128, b: 144 } },
  { name: "Szomorú", p: -0.8, a: -0.4, d: -0.5, color: { r: 70, g: 130, b: 180 } },
  { name: "Letargikus", p: -0.9, a: -0.7, d: -0.8, color: { r: 47, g: 79, b: 79 } },
  { name: "Unott", p: -0.5, a: -0.7, d: -0.3, color: { r: 105, g: 105, b: 105 } },
  { name: "Megvető", p: -0.4, a: 0.2, d: 0.7, color: { r: 128, g: 128, b: 0 } },
  { name: "Ellenséges", p: -0.6, a: 0.6, d: 0.4, color: { r: 139, g: 0, b: 0 } },
  { name: "Lenyűgözött", p: 0.5, a: 0.7, d: -0.4, color: { r: 0, g: 255, b: 255 } },
  { name: "Meglepett", p: 0.6, a: 0.8, d: -0.1, color: { r: 255, g: 255, b: 0 } },
];

const BALANCED_MOOD = {
  label: "Kiegyensúlyozott",
  color: { r: 150, g: 150, b: 150 } as MoodColor
};

export const getMoodInfo = (pad: PADState): { label: string; color: MoodColor } => {
  const { pleasure: p, arousal: a, dominance: d } = pad;
  const magnitude = Math.sqrt(p * p + a * a + d * d);

  if (magnitude < 0.25) {
    return BALANCED_MOOD;
  }

  let closest = EMOTION_ANCHORS[0];
  let minDistance = Infinity;

  EMOTION_ANCHORS.forEach(anchor => {
    const dist = Math.sqrt(
      Math.pow(p - anchor.p, 2) +
      Math.pow(a - anchor.a, 2) +
      Math.pow(d - anchor.d, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = anchor;
    }
  });

  let intensity = "";
  if (magnitude < 0.45) intensity = "Enyhén ";
  else if (magnitude > 0.85) intensity = "Kifejezetten ";

  return {
    label: `${intensity}${closest.name}`,
    color: closest.color
  };
};
