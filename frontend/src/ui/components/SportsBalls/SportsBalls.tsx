import React from 'react';
import './SportsBalls.css';


export const SoccerBalls: React.FC = () => {
  return (
    <div className="sports-balls-container soccer-side">
      {[1, 2, 3, 4, 5].map((num) => (
        <div key={num} className={`animated-ball ball-${num}`}>
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#1e293b" strokeWidth="4" />
            <polygon points="50,30 38,38 43,53 57,53 62,38" fill="#1e293b" />
            <line x1="50" y1="30" x2="50" y2="10" stroke="#1e293b" strokeWidth="4" />
            <line x1="38" y1="38" x2="20" y2="30" stroke="#1e293b" strokeWidth="4" />
            <line x1="43" y1="53" x2="30" y2="70" stroke="#1e293b" strokeWidth="4" />
            <line x1="57" y1="53" x2="70" y2="70" stroke="#1e293b" strokeWidth="4" />
            <line x1="62" y1="38" x2="80" y2="30" stroke="#1e293b" strokeWidth="4" />
            <polygon points="50,10 42,4 58,4" fill="#1e293b" />
            <polygon points="20,30 12,24 16,40" fill="#1e293b" />
            <polygon points="30,70 18,74 30,86" fill="#1e293b" />
            <polygon points="70,70 82,74 70,86" fill="#1e293b" />
            <polygon points="80,30 88,24 84,40" fill="#1e293b" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export const WallyBalls: React.FC = () => {
  return (
    <div className="sports-balls-container wally-side">
      {[1, 2, 3, 4, 5].map((num) => (
        <div key={num} className={`animated-ball ball-${num}`}>
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <circle cx="50" cy="50" r="46" fill="#facc15" stroke="#1e293b" strokeWidth="4" />
            <path d="M50,4 C24.6,4 4,24.6 4,50 C4,57.2 5.7,64 8.7,70 C14.3,55.7 28.5,45.7 45.1,45.1 C45.7,28.5 55.7,14.3 70,8.7 C64,5.7 57.2,4 50,4 Z" fill="#1d4ed8" />
            <path d="M96,50 C96,42.8 94.3,36 91.3,30 C85.7,44.3 71.5,54.3 54.9,54.9 C54.3,71.5 44.3,85.7 30,91.3 C36,94.3 42.8,96 50,96 C75.4,96 96,75.4 96,50 Z" fill="#ffffff" />
            <circle cx="50" cy="50" r="46" fill="none" stroke="#1e293b" strokeWidth="4" />
            <path d="M8,30 C30,40 40,30 30,8" fill="none" stroke="#1e293b" strokeWidth="3" />
            <path d="M92,70 C70,60 60,70 70,92" fill="none" stroke="#1e293b" strokeWidth="3" />
            <path d="M30,92 C40,70 30,60 8,70" fill="none" stroke="#1e293b" strokeWidth="3" />
            <path d="M70,8 C60,30 70,40 92,30" fill="none" stroke="#1e293b" strokeWidth="3" />
          </svg>
        </div>
      ))}
    </div>
  );
};
