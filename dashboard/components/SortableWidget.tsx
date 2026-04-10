'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal } from 'lucide-react';

interface SortableWidgetProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SortableWidget({ id, children, className }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative h-full ${className ?? ''}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-4 right-4 z-50 p-1.5 cursor-grab active:cursor-grabbing bg-black/40 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-white/10 hover:border-white/20 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        title="Drag to reorder"
      >
        <GripHorizontal className="w-4 h-4 text-slate-400" />
      </div>
      <div className="h-full group">
        {children}
      </div>
    </div>
  );
}
