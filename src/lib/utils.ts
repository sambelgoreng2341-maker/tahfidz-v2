import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getSevenDaysAgoString() {
  const today = new Date();
  today.setDate(today.getDate() - 7);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function suggestSesiWaktu() {
  const hour = new Date().getHours();
  if (hour >= 3 && hour < 11) {
    return 'Subuh';
  } else if (hour >= 11 && hour < 17) {
    return 'Ashar';
  } else {
    return 'Maghrib';
  }
}

export function formatIndonesianDate(dateString: string) {
  if (!dateString) return '';
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', options);
}

export function formatShortDate(dateString: string) {
  if (!dateString) return '';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', options);
}
