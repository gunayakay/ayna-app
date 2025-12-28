const openingHoursRegex = /^\d{2}:\d{2} - \d{2}:\d{2}$/;

/**
 * Validates if the given opening hours string is in a proper format
 * and checks if the time is within valid ranges.
 * @param value - The opening hours string to validate.
 * @returns True if valid, false otherwise.
 */
export default function formatOpeningHours(value: string): boolean {
  if (!value) return true;

  if (!openingHoursRegex.test(value)) {
    return false;
  }

  const [start, end] = value.split(' - ');

  const isValidTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  };

  return isValidTime(start) && isValidTime(end);
}
