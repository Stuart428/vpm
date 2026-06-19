import React from 'react';

// Define the TypeScript types for your props
interface MaterialIconProps {
  name: string;
  className?: string;
}

export default function MaterialIcon({ name, className = "" }: MaterialIconProps) {
  return (
    <span 
      className={`material-icons material-icon-inline ${className}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
