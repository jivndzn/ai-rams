
import { format, parseISO } from 'date-fns';
import { SYSTEM_TIMEZONE, SYSTEM_LOCALE } from './gemini/config';

/**
 * Formats a date with the system's configured timezone
 * @param date Date to format
 * @param formatStr Format string (date-fns compatible)
 * @returns Formatted date string
 */
export function formatDate(date: Date | number | string, formatStr: string = 'PPpp'): string {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Handle ISO strings
    dateObj = parseISO(date);
  } else {
    dateObj = new Date(date);
  }
  
  // Format with the specified format string and locale
  return format(dateObj, formatStr, { locale: SYSTEM_LOCALE });
}

/**
 * Format a timestamp for display
 * @param timestamp Unix timestamp or Date object
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number | Date | string): string {
  return formatDate(timestamp, 'MMMM d, yyyy h:mm a');
}

/**
 * Get current date in system timezone
 * @returns Current date string
 */
export function getCurrentDateFormatted(): string {
  return formatDate(new Date(), 'MMMM d, yyyy h:mm a');
}

/**
 * Format date for chart display (time only)
 * @param dateString ISO date string
 * @returns Formatted time string
 */
export function formatTimeForChart(dateString: string | undefined): string {
  if (!dateString) return "";
  return formatDate(dateString, 'h:mm a');
}
