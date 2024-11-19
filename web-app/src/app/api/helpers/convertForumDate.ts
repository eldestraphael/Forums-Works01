import { format, addDays } from "date-fns";

export function convertForumDate() {
  // Get today's date
  const today = new Date();

  // Add 1 day to today's date
  const nextDay = addDays(today, 1);

  // Format the date as 'd MMMM yyyy'
  return format(nextDay, "d MMMM yyyy");
}
