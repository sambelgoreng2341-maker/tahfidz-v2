import { ApiResponse, Log, Musyrif } from '../types';

const GAS_URL = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycby7a6JfqDm-PLUfYaIYtTXYtuKDzNK2o-WCWcc0da550_sn9cSF1tRydBeWUhbwgY1EkA/exec';

// --- SIMULATION DATA ---
function getSimulatedMusyrif(): Musyrif[] {
  return [
    { no: 1, id: 'MSR-001', nama: 'Ustadz Ahmad Fauzi, Lc.', halaqah: 'Halaqah Ali bin Abi Thalib', target: 30 },
    { no: 2, id: 'MSR-002', nama: 'Ustadz Muhammad Ridho', halaqah: 'Halaqah Utsman bin Affan', target: 30 },
    { no: 3, id: 'MSR-003', nama: 'Ustadz Suryana Saputra', halaqah: 'Halaqah Umar bin Khattab', target: 30 },
    { no: 4, id: 'MSR-004', nama: 'Ustadz Faisal Amri, S.Pd.', halaqah: 'Halaqah Abu Bakar Ash Shiddiq', target: 30 },
    { no: 5, id: 'MSR-005', nama: 'Ustadz Zainal Abidin', halaqah: 'Halaqah Zaid bin Tsabit', target: 30 },
  ];
}

function generateSimulatedLogs(musyrifList: Musyrif[]): Log[] {
  const logs: Log[] = [];
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 15; i >= 0; i--) {
    const tempDate = new Date(today);
    tempDate.setDate(today.getDate() - i);
    const yyyy = tempDate.getFullYear();
    const mm = String(tempDate.getMonth() + 1).padStart(2, '0');
    const dd = String(tempDate.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }

  const statuses = ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'S', 'I', 'A'];
  const times = ['Subuh', 'Ashar', 'Maghrib'];
  
  dates.forEach((d) => {
    times.forEach((t) => {
      musyrifList.forEach((m) => {
        const randStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const catatan = randStatus !== 'H' ? (randStatus === 'S' ? 'Sakit flu/demam' : 'Urusan luar kota') : '';
        logs.push({
          tanggal: d,
          waktu: t,
          id: m.id,
          nama: m.nama,
          status: randStatus,
          catatan: catatan,
          timestamp: `${d} 08:00:15`,
        });
      });
    });
  });
  return logs;
}

// --- API METHODS ---

export async function fetchDataApi(): Promise<{ response: ApiResponse; isSimulated: boolean }> {
  if (!GAS_URL) {
    // Simulate
    await new Promise((resolve) => setTimeout(resolve, 800));
    const cachedMusyrif = localStorage.getItem('sim_musyrif');
    const cachedLogs = localStorage.getItem('sim_logs_v5');
    
    if (cachedMusyrif && cachedLogs) {
      return {
        isSimulated: true,
        response: { success: true, musyrif: JSON.parse(cachedMusyrif), logs: JSON.parse(cachedLogs) }
      };
    }
    
    const musyrif = getSimulatedMusyrif();
    const logs = generateSimulatedLogs(musyrif);
    localStorage.setItem('sim_musyrif', JSON.stringify(musyrif));
    localStorage.setItem('sim_logs_v5', JSON.stringify(logs));
    
    return { isSimulated: true, response: { success: true, musyrif, logs } };
  }

  try {
    const res = await fetch(GAS_URL);
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return { isSimulated: false, response: data };
    } catch (parseError) {
      console.error('GAS response was not JSON. URL may be invalid or missing "Anyone" access.');
      throw new Error('Gagal memuat data dari server. Pastikan URL Google Apps Script valid dan Web App di-deploy dengan akses "Anyone". (Error 404 / Not Found)');
    }
  } catch (error) {
    throw new Error('Failed to fetch from GAS: ' + (error as Error).message);
  }
}

export async function submitAttendanceApi(dateStr: string, waktuStr: string, records: any[]): Promise<ApiResponse> {
  if (!GAS_URL) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const logs: Log[] = JSON.parse(localStorage.getItem('sim_logs_v5') || '[]');
    const filteredLogs = logs.filter((l) => !(l.tanggal === dateStr && l.waktu === waktuStr));
    
    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    records.forEach((r) => {
      filteredLogs.push({
        tanggal: dateStr,
        waktu: waktuStr,
        id: r.id,
        nama: r.nama,
        status: r.status,
        catatan: r.catatan,
        timestamp: timestampStr,
      });
    });
    
    localStorage.setItem('sim_logs_v5', JSON.stringify(filteredLogs));
    return { success: true, message: `Sesi ${waktuStr} berhasil disimpan!` };
  }

  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'submitAttendance', dateStr, waktuStr, records }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Avoid CORS preflight on GAS
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('GAS response was not JSON on submitAttendance. URL may be invalid or missing "Anyone" access.');
      throw new Error('Respons server tidak valid. Pastikan Web App di-deploy dengan akses "Anyone".');
    }
  } catch (error) {
    throw new Error('Failed to submit attendance: ' + (error as Error).message);
  }
}

export async function submitHolidayApi(dateStr: string, waktuStr: string, targetHoliday: boolean, musyrifList: Musyrif[]): Promise<ApiResponse> {
  if (!GAS_URL) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const logs: Log[] = JSON.parse(localStorage.getItem('sim_logs_v5') || '[]');
    const filteredLogs = logs.filter((l) => !(l.tanggal === dateStr && l.waktu === waktuStr));
    
    if (targetHoliday) {
      const now = new Date();
      const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} 08:00:00`;
      
      musyrifList.forEach((m) => {
        filteredLogs.push({
          tanggal: dateStr,
          waktu: waktuStr,
          id: m.id,
          nama: m.nama,
          status: 'L',
          catatan: 'Libur Halaqoh',
          timestamp: timestampStr,
        });
      });
    }
    
    localStorage.setItem('sim_logs_v5', JSON.stringify(filteredLogs));
    return { success: true, message: targetHoliday ? 'Sesi Berhasil Diliburkan!' : 'Sesi Aktif Kembali!' };
  }

  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'submitHoliday', dateStr, waktuStr, targetHoliday, musyrifList }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Avoid CORS preflight
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('GAS response was not JSON on submitHoliday. URL may be invalid or missing "Anyone" access.');
      throw new Error('Respons server tidak valid. Pastikan Web App di-deploy dengan akses "Anyone".');
    }
  } catch (error) {
    throw new Error('Failed to toggle holiday: ' + (error as Error).message);
  }
}
