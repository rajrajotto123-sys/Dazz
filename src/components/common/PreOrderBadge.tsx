import React from 'react';
import { cn } from '../../lib/utils';

interface PreOrderBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PreOrderBadge({ className, size = 'md' }: PreOrderBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5 font-bold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-black',
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  return (
    <span
      id="preorder-badge"
      className={cn(
        "inline-flex items-center rounded-full tracking-wider uppercase bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.25)] select-none whitespace-nowrap",
        sizeClasses[size],
        className
      )}
    >
      <span className={cn("relative flex", dotSizes[size])}>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 duration-1000" />
        <span className={cn("relative inline-flex rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,1)]", dotSizes[size])} />
      </span>
      <span>PRE-ORDER</span>
    </span>
  );
}
