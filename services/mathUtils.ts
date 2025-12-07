import { ShapeType } from '../types';
import * as THREE from 'three';

const COUNT = 15000;
const SCALE = 2;

// Helper to get random point in sphere
const randomInSphere = () => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random());
  const sinPhi = Math.sin(phi);
  return {
    x: r * sinPhi * Math.cos(theta),
    y: r * sinPhi * Math.sin(theta),
    z: r * Math.cos(phi)
  };
};

export const generateParticles = (shape: ShapeType): Float32Array => {
  const positions = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    let x = 0, y = 0, z = 0;
    const idx = i * 3;

    switch (shape) {
      case ShapeType.HEART: {
        // Heart formula
        const t = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()); // Even distribution
        // 3D Heart approximation
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // z varies to give thickness
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        
        // Use a simpler parametric heart
        const hx = 16 * Math.pow(Math.sin(phi), 3);
        const hy = 13 * Math.cos(phi) - 5 * Math.cos(2 * phi) - 2 * Math.cos(3 * phi) - Math.cos(4 * phi);
        const hz = 4 * Math.cos(theta) * Math.sin(phi); // Thickness

        x = hx * 0.15 * SCALE;
        y = hy * 0.15 * SCALE;
        z = hz * 0.5 * SCALE + (Math.random() - 0.5);
        break;
      }

      case ShapeType.SATURN: {
        const isRing = Math.random() > 0.3; // 70% ring, 30% planet
        if (isRing) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 3.5 + Math.random() * 2.5;
          x = Math.cos(angle) * dist * SCALE * 0.6;
          z = Math.sin(angle) * dist * SCALE * 0.6;
          y = (Math.random() - 0.5) * 0.2;
        } else {
          const p = randomInSphere();
          x = p.x * 1.5 * SCALE;
          y = p.y * 1.5 * SCALE;
          z = p.z * 1.5 * SCALE;
        }
        // Tilt Saturn
        const tilt = 0.4;
        const tempY = y;
        y = y * Math.cos(tilt) - z * Math.sin(tilt);
        z = tempY * Math.sin(tilt) + z * Math.cos(tilt);
        break;
      }

      case ShapeType.FLOWER: {
        // Phyllotaxis
        const angle = i * 137.5 * (Math.PI / 180);
        const r = 0.05 * Math.sqrt(i);
        const petalCurve = Math.sin(r * 5); 
        x = r * Math.cos(angle) * SCALE;
        z = r * Math.sin(angle) * SCALE;
        y = -r * 0.5 + Math.sin(r * 2) * 1.5;
        break;
      }

      case ShapeType.BUDDHA: {
        // Abstract Meditating Figure (Stacked Spheres + Aura)
        const part = Math.random();
        
        if (part < 0.4) {
          // Base/Legs (Flattened sphere)
          const p = randomInSphere();
          x = p.x * 2.5 * SCALE;
          y = p.y * 0.8 * SCALE - 1.5;
          z = p.z * 2.0 * SCALE;
        } else if (part < 0.75) {
          // Torso
          const p = randomInSphere();
          x = p.x * 1.2 * SCALE;
          y = p.y * 1.5 * SCALE + 0.5;
          z = p.z * 1.0 * SCALE;
        } else if (part < 0.9) {
          // Head
          const p = randomInSphere();
          x = p.x * 0.8 * SCALE;
          y = p.y * 0.8 * SCALE + 2.5;
          z = p.z * 0.8 * SCALE;
        } else {
          // Aura
           const angle = Math.random() * Math.PI * 2;
           const r = 3.5 + Math.random();
           x = Math.cos(angle) * r;
           y = (Math.random() - 0.5) * 6;
           z = Math.sin(angle) * r;
        }
        break;
      }
      
      case ShapeType.FIREWORKS: {
        // Explosion sphere
        const p = randomInSphere();
        x = p.x * 0.1; // Start small, expands in shader/loop
        y = p.y * 0.1;
        z = p.z * 0.1;
        // We actually want a big sphere but spread out
        const r = 4 * Math.cbrt(Math.random()); 
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta) * SCALE;
        y = r * Math.sin(phi) * Math.sin(theta) * SCALE;
        z = r * Math.cos(phi) * SCALE;
        break;
      }

      case ShapeType.SPHERE:
      default: {
        const p = randomInSphere();
        x = p.x * 3 * SCALE;
        y = p.y * 3 * SCALE;
        z = p.z * 3 * SCALE;
        break;
      }
    }

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
  }

  return positions;
};