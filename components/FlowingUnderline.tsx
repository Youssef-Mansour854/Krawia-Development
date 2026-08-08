import React from "react";

interface FlowingUnderlineProps {
  className?: string;
  color?: string;
}

export default function FlowingUnderline({
  className = "w-48 h-3 mt-2",
  color = "text-accent",
}: FlowingUnderlineProps) {
  return (
    <svg
      viewBox="0 0 240 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${color} ${className}`}
      aria-hidden="true"
    >
      <path
        d="M3 10 C 60 2, 140 14, 237 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
