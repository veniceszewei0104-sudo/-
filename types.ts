export enum ShapeType {
  HEART = 'HEART',
  FLOWER = 'FLOWER',
  SATURN = 'SATURN',
  BUDDHA = 'BUDDHA',
  FIREWORKS = 'FIREWORKS',
  SPHERE = 'SPHERE'
}

export interface ParticleData {
  positions: Float32Array;
  colors: Float32Array;
}

export interface HandData {
  detected: boolean;
  openness: number; // 0 (closed/fist) to 1 (open palm)
  position: { x: number; y: number };
}

export type ThemeColor = {
  name: string;
  hex: string;
  glow: string;
};