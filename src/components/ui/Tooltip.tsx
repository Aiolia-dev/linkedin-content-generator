'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = TooltipPrimitive.Content;

interface TooltipProps {
  children: React.ReactNode;
  content?: React.ReactNode;
}

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      {content && (
        <TooltipPrimitive.Portal>
          <TooltipContent
            className="z-50 overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white animate-in fade-in-0 zoom-in-95"
            sideOffset={5}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-gray-900" />
          </TooltipContent>
        </TooltipPrimitive.Portal>
      )}
    </TooltipRoot>
  );
}

export {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
};
