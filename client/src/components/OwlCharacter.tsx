import { useState, useEffect } from 'react';

interface OwlCharacterProps {
  isThinking?: boolean;
  isSpeaking?: boolean;
  emotion?: 'happy' | 'thoughtful' | 'encouraging' | 'neutral';
}

export function OwlCharacter({ 
  isThinking = false, 
  isSpeaking = false, 
  emotion = 'neutral' 
}: OwlCharacterProps) {
  const [eyeBlink, setEyeBlink] = useState(false);

  // Animated blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="flex items-center justify-center mb-4">
      <div className="relative w-24 h-24">
        <svg 
          viewBox="0 0 100 100" 
          className={`w-full h-full transition-transform duration-300 ${
            isSpeaking ? 'animate-bounce' : isThinking ? 'animate-pulse' : ''
          }`}
        >
          {/* Owl body */}
          <ellipse cx="50" cy="60" rx="35" ry="30" fill="#8B4513" />
          
          {/* Owl head */}
          <circle cx="50" cy="35" r="25" fill="#D2691E" />
          
          {/* Ear tufts */}
          <path d="M30 15 L25 5 L35 10 Z" fill="#8B4513" />
          <path d="M70 15 L75 5 L65 10 Z" fill="#8B4513" />
          
          {/* Eyes background */}
          <circle cx="42" cy="30" r="8" fill="white" />
          <circle cx="58" cy="30" r="8" fill="white" />
          
          {/* Eyes */}
          <circle 
            cx="42" 
            cy={eyeBlink ? "32" : "30"} 
            r={eyeBlink ? "2" : "5"} 
            fill="black"
            className="transition-all duration-150"
          />
          <circle 
            cx="58" 
            cy={eyeBlink ? "32" : "30"} 
            r={eyeBlink ? "2" : "5"} 
            fill="black"
            className="transition-all duration-150"
          />
          
          {/* Eye highlights */}
          {!eyeBlink && (
            <>
              <circle cx="44" cy="28" r="1.5" fill="white" />
              <circle cx="60" cy="28" r="1.5" fill="white" />
            </>
          )}
          
          {/* Beak */}
          <path 
            d="M45 38 L50 42 L55 38 Z" 
            fill="#FF8C00"
            className={isSpeaking ? 'animate-pulse' : ''}
          />
          
          {/* Wing */}
          <ellipse cx="35" cy="55" rx="8" ry="12" fill="#A0522D" />
          <ellipse cx="65" cy="55" rx="8" ry="12" fill="#A0522D" />
          
          {/* Chest feathers */}
          <ellipse cx="50" cy="50" rx="15" ry="10" fill="#DEB887" />
          
          {/* Feet */}
          <ellipse cx="45" cy="85" rx="3" ry="5" fill="#FF8C00" />
          <ellipse cx="55" cy="85" rx="3" ry="5" fill="#FF8C00" />
          
          {/* Thinking bubble (when thinking) */}
          {isThinking && (
            <g className="animate-fade-in">
              <circle cx="75" cy="20" r="3" fill="white" stroke="#ccc" />
              <circle cx="80" cy="15" r="2" fill="white" stroke="#ccc" />
              <circle cx="83" cy="10" r="1" fill="white" stroke="#ccc" />
            </g>
          )}
          
          {/* Eyebrows for emotions */}
          {emotion === 'thoughtful' && (
            <>
              <path d="M35 25 Q42 22 45 25" stroke="#8B4513" strokeWidth="2" fill="none" />
              <path d="M55 25 Q58 22 65 25" stroke="#8B4513" strokeWidth="2" fill="none" />
            </>
          )}
          
          {emotion === 'happy' && (
            <>
              <path d="M35 23 Q42 20 45 23" stroke="#8B4513" strokeWidth="2" fill="none" />
              <path d="M55 23 Q58 20 65 23" stroke="#8B4513" strokeWidth="2" fill="none" />
            </>
          )}
          
          {emotion === 'encouraging' && (
            <>
              <path d="M35 24 Q42 21 45 24" stroke="#8B4513" strokeWidth="2" fill="none" />
              <path d="M55 24 Q58 21 65 24" stroke="#8B4513" strokeWidth="2" fill="none" />
            </>
          )}
        </svg>
        
        {/* Character name */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Mark
          </span>
        </div>
      </div>
    </div>
  );
}