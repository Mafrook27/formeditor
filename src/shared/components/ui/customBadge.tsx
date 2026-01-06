import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  type: "success" | "warning" | "danger" | "info";
}

const BadgeCustom: React.FC<BadgeProps> = ({ children, type }) => {
  const styles = {
    success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border border-amber-200",
    danger: "bg-rose-100 text-rose-700 border border-rose-200",
    info: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-xs font-semibold ${styles[type]}`}
    >
      {children}
    </span>
  );
};

export default BadgeCustom;
