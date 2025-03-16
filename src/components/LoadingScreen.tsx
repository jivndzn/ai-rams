import { useState, useEffect } from "react";
import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 20000); // Show loading screen for 5 seconds
    
    return () => clearTimeout(timer);
  }, []);

  // Create multiple raindrop animations
  const raindrops = Array.from({ length: 12 }).map((_, index) => {
    const size = Math.floor(Math.random() * 30) + 10; // Random size between 10-40px
    const delay = Math.random() * 0.8; // Random delay between 0-0.8s
    const duration = (Math.random() * 1) + 1.5; // Random duration between 1.5-2.5s
    const leftPosition = Math.random() * 80 + 10; // Random position between 10-90%
    
    return (
      <div 
        key={index}
        className="absolute opacity-0 text-primary"
        style={{
          left: `${leftPosition}%`,
          top: "-50px",
          animation: `falling ${duration}s ease-in ${delay}s infinite`,
          fontSize: `${size}px`,
        }}
      >
        <Droplets size={size} />
      </div>
    );
  });

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 flex flex-col items-center justify-center bg-background z-50",
        "animate-fade-out transition-opacity duration-500 ease-in-out",
      )}
    >
      <style>
        {`
          @keyframes falling {
            0% {
              transform: translateY(-10px);
              opacity: 0;
            }
            50% {
              opacity: 0.7;
            }
            100% {
              transform: translateY(100vh);
              opacity: 0;
            }
          }
        `}
      </style>
      
      {raindrops}
      
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">AI-RAMS</h1>
        <p className="text-lg text-muted-foreground">
          Rainwater Analysis and Management System
        </p>
      </div>
      
      <div className="mt-8 animate-pulse">
        <Droplets className="h-12 w-12 text-primary" />
      </div>
    </div>
  );
};

export default LoadingScreen;
