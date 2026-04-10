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
        className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 cursor-grab active:cursor-grabbing bg-nebula-accent/25 backdrop-blur-md rounded-full border border-nebula-accent/50 opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-[0_0_12px_rgba(139,92,246,0.3)] hover:bg-nebula-accent/40 flex items-center gap-1.5"
        title="Drag to reorder"
      >
        <GripHorizontal className="w-3.5 h-3.5 text-nebula-accent" />
        <span className="text-[8px] font-black uppercase tracking-widest text-nebula-accent">drag</span>
      </div>
      <div className="h-full group">
        {children}
      </div>
    </div>
  );
}
