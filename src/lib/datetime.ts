
import { format, parseISO, isValid } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { SYSTEM_TIMEZONE } from './gemini/config';

/**
 * Checks if a date is valid
 * @param date Date to check
 * @returns boolean indicating if date is valid
 */
export function isValidDate(date: Date | number | string): boolean {
  if (typeof date === 'string') {
    // Try to parse the string as a date
    const parsed = new Date(date);
    return isValid(parsed);
  }
  return isValid(new Date(date));
}

/**
 * Formats a date with the system's configured timezone
 * @param date Date to format
 * @param formatStr Format string (date-fns compatible)
 * @returns Formatted date string
 */
export function formatDate(date: Date | number | string, formatStr: string = 'PPpp'): string {
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Handle ISO strings
      dateObj = parseISO(date);
    } else {
      dateObj = new Date(date);
    }
    
    // Check if the date is valid before formatting
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    
    // Format with the specified format string and timezone
    return formatInTimeZone(dateObj, SYSTEM_TIMEZONE, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
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
  return formatDate(new Date(), 'MMMM d, yyyy h:mm a') + ' (' + SYSTEM_TIMEZONE.split('/')[1] + ')';
}

/**
 * Format date for chart display (time only)
 * @param dateString ISO date string
 * @returns Formatted time string
 */
export function formatTimeForChart(dateString: string | undefined): string {
  if (!dateString) return "";
  if (!isValidDate(dateString)) return "Invalid";
  return formatDate(dateString, 'h:mm a');
}
