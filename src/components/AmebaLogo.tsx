import React from 'react';

interface AmebaLogoProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  withNucleus?: boolean;
}

export const AmebaLogo: React.FC<AmebaLogoProps> = ({
  className = 'w-6 h-6',
  size,
  strokeWidth = 1.8,
  withNucleus = true,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="AMEBA Logo"
    >
      {/* Organic outline silhouette of an amoeba with smooth pseudopodia */}
      <path d="M12 3.2C8.8 3 6.6 4.8 5.7 6.9C4.5 9.7 2.9 11.4 3.4 14.2C3.9 16.9 6.2 18 8.4 19.4C11 21 14.5 20.9 17.2 19.3C19.9 17.7 21.5 15.1 20.8 12.3C20.2 9.7 21.1 7.9 19.2 5.9C17.3 3.9 14.9 3.4 12 3.2Z" />
      {/* Elegant minimalist nucleus */}
      {withNucleus && (
        <circle cx="11.5" cy="11.5" r="1.4" fill="currentColor" stroke="none" />
      )}
    </svg>
  );
};
