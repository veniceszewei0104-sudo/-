import React from 'react';
import { ShapeType, ThemeColor } from '../types';
import { Activity, Flower, Globe, User, Zap, Maximize2, Minimize2 } from 'lucide-react';

interface UIOverlayProps {
  currentShape: ShapeType;
  setShape: (s: ShapeType) => void;
  colors: ThemeColor[];
  currentColor: ThemeColor;
  setColor: (c: ThemeColor) => void;
  handOpenness: number;
  isHandDetected: boolean;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  currentShape,
  setShape,
  colors,
  currentColor,
  setColor,
  handOpenness,
  isHandDetected,
  onToggleFullscreen,
  isFullscreen
}) => {

  const shapes = [
    { type: ShapeType.HEART, icon: <Activity className="w-5 h-5" />, label: "Heart" },
    { type: ShapeType.FLOWER, icon: <Flower className="w-5 h-5" />, label: "Flower" },
    { type: ShapeType.SATURN, icon: <Globe className="w-5 h-5" />, label: "Saturn" },
    { type: ShapeType.BUDDHA, icon: <User className="w-5 h-5" />, label: "Zen" },
    { type: ShapeType.FIREWORKS, icon: <Zap className="w-5 h-5" />, label: "Spark" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            ZEN<span className="text-blue-400">PARTICLES</span>
          </h1>
          <p className="text-xs text-blue-200 mt-1 uppercase tracking-widest opacity-70">
            Interactive 3D System
          </p>
        </div>
        
        <button 
          onClick={onToggleFullscreen}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/10"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* Hand Indicator */}
      <div className="absolute top-1/2 right-6 transform -translate-y-1/2 flex flex-col items-center gap-2">
         <div className="h-48 w-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700 backdrop-blur-sm">
            <div 
              className={`w-full absolute bottom-0 transition-all duration-300 ${isHandDetected ? 'bg-gradient-to-t from-green-500 to-emerald-300' : 'bg-red-900/50'}`}
              style={{ height: `${isHandDetected ? handOpenness * 100 : 0}%` }}
            />
         </div>
         <span className="text-[10px] text-gray-400 uppercase rotate-90 mt-8 whitespace-nowrap">
            {isHandDetected ? (handOpenness > 0.5 ? "EXPAND" : "CONTRACT") : "NO HAND"}
         </span>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col md:flex-row gap-6 items-end pointer-events-auto">
        
        {/* Shape Selector */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex gap-2">
          {shapes.map((item) => (
            <button
              key={item.type}
              onClick={() => setShape(item.type)}
              className={`
                group relative flex items-center justify-center p-3 rounded-xl transition-all duration-300
                ${currentShape === item.type 
                  ? 'bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
              title={item.label}
            >
              {item.icon}
              <span className="absolute -top-8 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Color Picker */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex gap-3 items-center">
          <span className="text-xs text-gray-400 font-bold uppercase mr-2">Color</span>
          {colors.map((c) => (
            <button
              key={c.name}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full transition-all duration-300 border-2 ${
                currentColor.name === c.name ? 'border-white scale-110' : 'border-transparent hover:scale-110'
              }`}
              style={{ backgroundColor: c.hex, boxShadow: currentColor.name === c.name ? `0 0 10px ${c.hex}` : 'none' }}
              title={c.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;