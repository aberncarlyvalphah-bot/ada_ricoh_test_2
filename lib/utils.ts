import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function to merge Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format file size in human-readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const m = k * 1024
  const g = m * 1024

  if (bytes < k) return `${bytes} Bytes`
  if (bytes < m) return `${(bytes / k).toFixed(1)} KB`
  if (bytes < g) return `${(bytes / m).toFixed(1)} MB`
  return `${(bytes / g).toFixed(1)} GB`
}

// Format date in a user-friendly format
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// Generate a unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

// Download data as file
export function downloadAsFile<T>(data: T, filename: string, type = "application/json"): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Deep clone an object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// Check if value is empty
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === "string") {
    const str = value as string
    if (str.trim() === "") return true
  }
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === "object" && Object.keys(value).length === 0) return true
  return false
}

// Truncate text with ellipsis
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.substring(0, length)}...`
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return ((value / total) * 100)
}

// Get random color
export function getRandomColor(index: number): string {
  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // yellow
    "#ef4444", // red
    "#8b5cf6", // cyan
    "#ec4899", // purple
    "#f97316", // orange
    "#6366f1", // slate
  ]
  return colors[index % colors.length]
}

// Sleep utility for async operations
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
