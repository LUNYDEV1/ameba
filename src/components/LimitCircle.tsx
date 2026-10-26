import React from 'react';
import { useLimits } from '../context/LimitContext';

interface LimitCircleProps {
  onClick?: () => void;
  className?: string;
  size?: number;
}

export const LimitCircle: React.FC<LimitCircleProps> = ({ onClick, className = '', size = 34 }) => {
  const { percentRemaining, tariffInfo, remainingTokens, maxTokens, formatTokens } = useLimits();

  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentRemaining / 100) * circumference;

  let strokeColor = 'stroke-[#0d0d0d] dark:stroke-white';
  if (percentRemaining === 0) {
    strokeColor = 'stroke-red-500';
  } else if (percentRemaining <= 20) {
    strokeColor = 'stroke-amber-500';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 ${className}`}
      title={`Лимит тарифа ${tariffInfo.name}: ${percentRemaining}% осталось (${formatTokens(remainingTokens)} / ${formatTokens(maxTokens)} токенов). Нажмите для управления тарифами.`}
      aria-label="Лимиты тарифа"
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-black/10 dark:stroke-white/10 fill-none"
        />
        {/* Filled Progress Segment */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`fill-none transition-all duration-500 ease-out ${strokeColor}`}
        />
      </svg>
      {/* Inner percentage text */}
      <span className="absolute text-[10px] font-mono font-semibold text-[#0d0d0d] dark:text-[#f0f0f0]">
        {percentRemaining}%
      </span>
    </button>
  );
};
