import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format date relative to now
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return then.toLocaleDateString();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Get avatar URL from Discord user
 */
export function getAvatarUrl(userId: string, avatarHash?: string): string {
  if (!avatarHash) {
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(userId) % 5}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
}

/**
 * Get guild icon URL
 */
export function getGuildIconUrl(guildId: string, iconHash?: string): string {
  if (!iconHash) return '/default-guild-icon.png';
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

/**
 * Get status color based on status string
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: 'text-discord-green',
    pending: 'text-discord-yellow',
    rejected: 'text-discord-red',
    approved: 'text-discord-green',
    closed: 'text-dark-muted',
    open: 'text-discord-green',
  };
  return statusColors[status.toLowerCase()] || 'text-dark-text';
}

/**
 * Get command category color
 */
export function getCategoryColor(category: string): string {
  const categoryColors: Record<string, string> = {
    moderation: 'bg-discord-red',
    utility: 'bg-discord-blurple',
    fun: 'bg-discord-fuchsia',
    admin: 'bg-discord-yellow',
    info: 'bg-discord-green',
  };
  return categoryColors[category.toLowerCase()] || 'bg-dark-border';
}
