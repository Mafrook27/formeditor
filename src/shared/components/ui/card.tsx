import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className = "", style }) => (
  <div
    className={`bg-white border border-theme-border rounded-xl p-3 shadow-sm ${className}`}
    style={style}
  >
    {children}
  </div>
);

export default Card;
