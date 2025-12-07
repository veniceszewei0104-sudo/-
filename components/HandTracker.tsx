import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { HandData } from '../types';

interface HandTrackerProps {
  onHandUpdate: (data: HandData) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);

  // Initialize MediaPipe
  useEffect(() => {
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setLoaded(true);
      } catch (err) {
        console.error("Failed to load MediaPipe:", err);
      }
    };
    init();
  }, []);

  // Camera Setup
  useEffect(() => {
    if (!loaded || !videoRef.current) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 } // Low res is fine for gesture
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predict);
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startCamera();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const predict = () => {
    if (!handLandmarkerRef.current || !videoRef.current) return;

    const video = videoRef.current;
    if (video.currentTime !== lastVideoTimeRef.current) {
      const results: HandLandmarkerResult = handLandmarkerRef.current.detectForVideo(video, performance.now());
      processResults(results);
      lastVideoTimeRef.current = video.currentTime;
    }
    
    animationFrameRef.current = requestAnimationFrame(predict);
  };

  const processResults = (results: HandLandmarkerResult) => {
    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      
      // Calculate openness: Distance between Wrist (0) and Tips (4, 8, 12, 16, 20)
      // Normalized by bounding box or relative scale would be better, but simple average distance works for simple open/close.
      
      const wrist = landmarks[0];
      const tips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky
      
      let totalDist = 0;
      tips.forEach(idx => {
        const tip = landmarks[idx];
        const d = Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
        totalDist += d;
      });
      
      const avgDist = totalDist / 5;
      
      // Heuristic: Closed fist avgDist is ~0.1-0.2, Open palm is ~0.4-0.6 (depends on camera distance)
      // We map 0.15 -> 0.45 to 0 -> 1
      const minClosed = 0.15;
      const maxOpen = 0.45;
      const openness = Math.min(Math.max((avgDist - minClosed) / (maxOpen - minClosed), 0), 1);

      onHandUpdate({
        detected: true,
        openness,
        position: { x: wrist.x, y: wrist.y }
      });
    } else {
      onHandUpdate({
        detected: false,
        openness: 0,
        position: { x: 0, y: 0 }
      });
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50 opacity-80 hover:opacity-100 transition-opacity">
      {/* Hidden processing video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-32 h-24 rounded-lg border-2 border-white/20 transform -scale-x-100 bg-black object-cover"
      />
      <div className="absolute bottom-1 left-1 bg-black/50 px-2 py-0.5 rounded text-[10px] text-white">
        {loaded ? "Tracking Active" : "Loading AI..."}
      </div>
    </div>
  );
};

export default HandTracker;