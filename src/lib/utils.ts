import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(url: any) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http")) return url;

  // Since we have a Next.js proxy rewrite for /uploads/cars/ 
  // we return the local route which prevents Cross-Origin-Resource-Policy errors.
  return url.startsWith("/") ? url : `/uploads/cars/${url}`;
}
