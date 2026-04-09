'use client';

import { Card } from "@tremor/react";

export function NodeCardSkeleton() {
  return (
    <Card className="relative bg-white/[0.03] ring-1 ring-white/5 overflow-hidden rounded-[2.5rem] backdrop-blur-3xl shadow-2xl animate-pulse">
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl" />
            <div className="space-y-2">
              <div className="w-32 h-6 bg-white/5 rounded-md" />
              <div className="w-16 h-3 bg-white/5 rounded-md" />
            </div>
          </div>
          <div className="w-10 h-10 bg-white/5 rounded-2xl" />
        </div>

        <div className="h-32 w-full bg-white/5 rounded-3xl" />

        <div className="pt-8 border-t border-white/5 flex justify-between gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 space-y-2">
              <div className="w-full h-2 bg-white/5 rounded-full" />
              <div className="w-1/2 h-4 bg-white/5 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
