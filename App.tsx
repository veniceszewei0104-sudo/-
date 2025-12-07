import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import HandTracker from './components/HandTracker';
import ParticleScene from './components/ParticleScene';
import UIOverlay from './components/UIOverlay';
import { HandData, ShapeType, ThemeColor } from './types';

// Constants
const THEME_COLORS: ThemeColor[] = [
  { name: 'Cyan', hex: '#00f7ff', glow: '#00f7ff' },
  { name: 'Magenta', hex: '#ff00aa', glow: '#ff00aa' },
  { name: 'Lime', hex: '#ccff00', glow: '#ccff00' },
  { name: 'Gold', hex: '#ffaa00', glow: '#ffaa00' },
  { name: 'White', hex: '#ffffff', glow: '#ffffff' },
];

const App: React.FC = () => {
  const [shape, setShape] = useState<ShapeType>(ShapeType.HEART);
  const [color, setColor] = useState<ThemeColor>(THEME_COLORS[0]);
  const [handData, setHandData] = useState<HandData>({
    detected: false,
    openness: 0,
    position: { x: 0, y: 0 }
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleHandUpdate = useCallback((data: HandData) => {
    // Smooth the data slightly to avoid jitter (simple lerp)
    setHandData(prev => ({
      detected: data.detected,
      openness: prev.openness + (data.openness - prev.openness) * 0.2, // 0.2 smoothing factor
      position: data.position
    }));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none">
      
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 2]} // Support high DPI
        gl={{ antialias: false, alpha: false }} // Optimization
      >
        <color attach="background" args={['#050505']} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <ParticleScene 
          shape={shape} 
          color={color} 
          interactionValue={handData.openness}
          isHandDetected={handData.detected}
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate={!handData.detected} 
          autoRotateSpeed={0.5}
          maxDistance={20}
          minDistance={5}
        />
      </Canvas>

      {/* Hand Tracking Logic (Invisible/PiP) */}
      <HandTracker onHandUpdate={handleHandUpdate} />

      {/* UI Overlay */}
      <UIOverlay
        currentShape={shape}
        setShape={setShape}
        colors={THEME_COLORS}
        currentColor={color}
        setColor={setColor}
        handOpenness={handData.openness}
        isHandDetected={handData.detected}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />
      
      {/* Instructions / Status */}
      {!handData.detected && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-dashed border-white/20 rounded-full mb-4 flex items-center justify-center">
               <div className="w-8 h-8 bg-white/10 rounded-full" />
            </div>
            <p className="text-white/50 text-sm tracking-widest uppercase">Show Hand to Control</p>
            <p className="text-white/30 text-xs mt-1">Open Palm to Expand • Fist to Contract</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;