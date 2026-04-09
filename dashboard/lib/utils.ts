import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ONLINE_THRESHOLD_MINUTES } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRelativeTime(timestamp: string | Date): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInMs = now.getTime() - past.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMins / 60);

  if (diffInMins < 1) return "Just now";
  if (diffInMins < 60) return `${diffInMins}m ago`;
  return `${diffInHours}h ago`;
}

export function isNodeOnline(lastSeen: string | Date): boolean {
  const ms = Date.now() - new Date(lastSeen).getTime();
  return ms / 60000 < ONLINE_THRESHOLD_MINUTES;
}

export function formatProcessName(cmd: string): string {
  // 1. Clean path and arguments
  // Remove everything after first space (arguments)
  let name = cmd.split(' ')[0];
  
  // Strip paths
  const lastSlash = name.lastIndexOf('/');
  if (lastSlash !== -1) {
    name = name.substring(lastSlash + 1);
  }

  // 2. Special case for chromium/browsers which often have deep paths even after stripping
  if (name.includes('chromium')) name = 'chromium';
  if (name.includes('node')) name = 'node';

  // 3. Capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
