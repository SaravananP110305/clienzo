/**
 * Formats a date string (YYYY-MM-DD), milliseconds timestamp (number), or Date object to "DD/MM/YYYY" format.
 * Prevents timezone shifting bugs by parsing components directly for YYYY-MM-DD strings.
 */
export function formatDate(date: string | number | Date | undefined | null): string {
  if (!date) return "—";
  
  if (date instanceof Date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  if (typeof date === "number") {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // If it's a string, match YYYY-MM-DD
  const match = String(date).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [_, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  // Handle DD/MM/YYYY inputs gracefully (return as is)
  const ddmmyyyyMatch = String(date).match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (ddmmyyyyMatch) {
    return String(date);
  }

  // Fallback to basic Date parsing for ISO timestamps
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formats a time string (HH:mm or HH:mm:ss or hh:mm AM/PM) to "hh:mm AM/PM" format.
 */
export function formatTime(time: string | undefined | null): string {
  if (!time) return "—";
  
  const trimmed = time.trim();
  // If it is already in hh:mm AM/PM format, return it uppercase
  if (/^\d{2}:\d{2}\s*(?:AM|PM)$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  
  // Try parsing HH:mm or HH:mm:ss
  const parts = trimmed.split(":");
  if (parts.length >= 2) {
    const hour = parseInt(parts[0], 10);
    const min = parseInt(parts[1], 10);
    if (!isNaN(hour) && !isNaN(min)) {
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const formattedHour = String(displayHour).padStart(2, "0");
      const formattedMin = String(min).padStart(2, "0");
      return `${formattedHour}:${formattedMin} ${ampm}`;
    }
  }
  return time;
}
