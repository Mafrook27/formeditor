import React from "react";

interface ValueProps {
  children: React.ReactNode;
  className?: string;
}

const Value: React.FC<ValueProps> = ({ children, className = "" }) => (
  <p className={`text-slate-900 text-sm font-medium truncate ${className}`}>
    {children}
  </p>
);

export default Value;
