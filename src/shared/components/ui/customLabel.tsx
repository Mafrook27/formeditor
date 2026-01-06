import React from "react";

interface LabelProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const LabelCustom: React.FC<LabelProps> = ({
  children,
  className = "",
  style,
  ...props
}) => (
  <p
    className={`text-slate-500 text-xs font-medium mb-1 ${className}`}
    style={style}
    {...props}
  >
    {children}
  </p>
);

export default LabelCustom;
