export interface Musyrif {
  no: number;
  id: string;
  nama: string;
  halaqah: string;
  target: number;
}

export interface Log {
  tanggal: string;
  waktu: string;
  id: string;
  nama: string;
  status: string;
  catatan: string;
  timestamp: string;
}

export interface AppState {
  musyrif: Musyrif[];
  logs: Log[];
  selectedDate: string;
  selectedWaktu: string;
  selectedDashWaktu: string;
  currentTab: string;
  rekapType: string;
  rekapSelectedDate: string;
  rekapSelectedWaktu: string;
  rekapStartDate: string;
  rekapEndDate: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  musyrif?: Musyrif[];
  logs?: Log[];
}
