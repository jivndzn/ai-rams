
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { SYSTEM_TIMEZONE } from './gemini/config';

/**
 * Checks if a value is a valid date
 * @param date Value to check
 * @returns Boolean indicating if the value can be parsed as a valid date
 */
export function isValidDate(date: any): boolean {
  if (!date) return false;
  
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

/**
 * Formats a date with the system's configured timezone
 * @param date Date to format
 * @param formatStr Format string (date-fns compatible)
 * @returns Formatted date string
 */
export function formatDate(date: Date | number | string, formatStr: string = 'PPpp'): string {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Handle ISO strings
    try {
      dateObj = parseISO(date);
      if (!isValidDate(dateObj)) {
        return 'Invalid date';
      }
    } catch (error) {
      return 'Invalid date';
    }
  } else {
    dateObj = new Date(date);
    if (!isValidDate(dateObj)) {
      return 'Invalid date';
    }
  }
  
  // Format with the specified format string and timezone
  try {
    return formatInTimeZone(dateObj, SYSTEM_TIMEZONE, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date format error';
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
  return formatDate(dateString, 'h:mm a');
}
