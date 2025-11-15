// Date utility functions for the College Organizer

export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function isToday(date: string): boolean {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    today.getFullYear() === checkDate.getFullYear() &&
    today.getMonth() === checkDate.getMonth() &&
    today.getDate() === checkDate.getDate()
  );
}

export function isPast(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  return checkDate < today;
}

export function isFuture(date: string): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const checkDate = new Date(date);
  return checkDate > today;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function getDayName(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

export function getMonthName(month: number): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[month];
}

export function getWeekDates(date: string): string[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const week: string[] = [];
  
  for (let i = 0; i < 7; i++) {
    const weekDay = new Date(d.setDate(diff + i));
    week.push(weekDay.toISOString().split("T")[0]);
  }
  
  return week;
}

export function compareDates(a: string, b: string): number {
  return new Date(a).getTime() - new Date(b).getTime();
}
