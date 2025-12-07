import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeType, ThemeColor } from '../types';
import { generateParticles } from '../services/mathUtils';

interface ParticleSceneProps {
  shape: ShapeType;
  color: ThemeColor;
  interactionValue: number; // 0 to 1
  isHandDetected: boolean;
}

const ParticleScene: React.FC<ParticleSceneProps> = ({ shape, color, interactionValue, isHandDetected }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Buffers
  const { positions, originalPositions } = useMemo(() => {
    const pos = generateParticles(shape);
    return {
      positions: new Float32Array(pos), // Mutable current positions
      originalPositions: pos // Target positions
    };
  }, [shape]);

  // Update target positions when shape changes
  useEffect(() => {
    if (pointsRef.current) {
      // We don't replace the buffer attribute entirely to avoid memory churn if possible,
      // but geometry.setAttribute is easiest for shape swap.
      const geometry = pointsRef.current.geometry;
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
  }, [positions]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.getElapsedTime();
    const positionsAttribute = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = positionsAttribute.array as Float32Array;

    // Smooth interaction value
    const targetScale = isHandDetected ? 0.5 + (interactionValue * 1.5) : 1; // 0.5 (closed) to 2.0 (open)
    const targetSpread = isHandDetected ? interactionValue : 0.5; // 0 (tight) to 1 (chaos)

    for (let i = 0; i < originalPositions.length; i += 3) {
      const ox = originalPositions[i];
      const oy = originalPositions[i + 1];
      const oz = originalPositions[i + 2];

      // Base movement (breathing)
      const breath = 1 + Math.sin(time * 0.5 + ox * 0.5) * 0.05;

      // Noise/Wander
      const noiseX = Math.sin(time * 0.2 + oy) * 0.1 * targetSpread;
      const noiseY = Math.cos(time * 0.3 + oz) * 0.1 * targetSpread;
      const noiseZ = Math.sin(time * 0.4 + ox) * 0.1 * targetSpread;

      // Target calculation
      let tx = ox * targetScale * breath + noiseX;
      let ty = oy * targetScale * breath + noiseY;
      let tz = oz * targetScale * breath + noiseZ;

      if (shape === ShapeType.FIREWORKS) {
         // Special logic for fireworks: explode outward
         const expansion = (Math.sin(time) + 1.2); // Pulsing explosion
         tx *= expansion;
         ty *= expansion;
         tz *= expansion;
      }
      
      // Interpolate current to target (Lerp)
      // Faster lerp if hand is moving, slower for idle animation
      const lerpFactor = 0.1;
      
      array[i] += (tx - array[i]) * lerpFactor;
      array[i + 1] += (ty - array[i + 1]) * lerpFactor;
      array[i + 2] += (tz - array[i + 2]) * lerpFactor;
    }

    positionsAttribute.needsUpdate = true;
    
    // Rotate entire system slowly
    pointsRef.current.rotation.y += 0.001;
    if (!isHandDetected) {
       pointsRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={new THREE.Color(color.hex)}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
};

export default ParticleScene;