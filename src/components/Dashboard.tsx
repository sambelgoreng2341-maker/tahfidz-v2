import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import { CheckCheck, CheckCircle, GraduationCap, Info, Lightbulb, Percent, UserX, Users } from 'lucide-react';
import { AppState } from '../types';
import { formatIndonesianDate } from '../lib/utils';

export default function Dashboard({ appState, onFilterWaktu }: { appState: AppState, onFilterWaktu: (w: string) => void }) {
  const { musyrif, logs, selectedDate, selectedDashWaktu } = appState;

  let logsFilteredToday = logs.filter((l) => l.tanggal === selectedDate);
  let logsOverall = [...logs];

  if (selectedDashWaktu !== 'Semua') {
    logsFilteredToday = logsFilteredToday.filter((l) => l.waktu === selectedDashWaktu);
    logsOverall = logsOverall.filter((l) => l.waktu === selectedDashWaktu);
  }

  const activeLogsToday = logsFilteredToday.filter((l) => l.status !== 'L');
  const activeLogsOverall = logsOverall.filter((l) => l.status !== 'L');
  const holidayLogsCount = logsFilteredToday.filter((l) => l.status === 'L').length;

  const hadirToday = activeLogsToday.filter((l) => l.status === 'H').length;
  const sakitToday = activeLogsToday.filter((l) => l.status === 'S').length;
  const izinToday = activeLogsToday.filter((l) => l.status === 'I').length;
  const alpaToday = activeLogsToday.filter((l) => l.status === 'A').length;

  const targetTotalAbsen = selectedDashWaktu === 'Semua' ? musyrif.length * 3 : musyrif.length;
  const belumAbsen = Math.max(0, targetTotalAbsen - activeLogsToday.length - holidayLogsCount);

  let attendanceRate = '0%';
  if (activeLogsOverall.length > 0) {
    const totalHadir = activeLogsOverall.filter((l) => l.status === 'H').length;
    attendanceRate = Math.round((totalHadir / activeLogsOverall.length) * 100) + '%';
  }

  const pieData = [
    { name: 'Hadir', value: hadirToday, color: '#059669' },
    { name: 'Sakit', value: sakitToday, color: '#f59e0b' },
    { name: 'Izin', value: izinToday, color: '#3b82f6' },
    { name: 'Alpa', value: alpaToday, color: '#e11d48' },
    { name: 'Libur', value: holidayLogsCount, color: '#64748b' },
    { name: 'Belum Diisi', value: belumAbsen, color: '#e2e8f0' },
  ].filter(d => d.value > 0);

  const barData = musyrif.map((m) => {
    let mLogs = logs.filter((l) => l.id === m.id);
    if (selectedDashWaktu !== 'Semua') {
      mLogs = mLogs.filter((l) => l.waktu === selectedDashWaktu);
    }
    const active = mLogs.filter((l) => l.status !== 'L');
    const hadir = active.filter((l) => l.status === 'H').length;
    const percent = active.length > 0 ? Math.round((hadir / active.length) * 100) : 0;
    return { name: m.nama.split(',')[0].substring(0, 15), percent };
  });

  return (
    <section className="space-y-6 animate-in fade-in duration-500">
      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800">Visualisasi Metrik Performa</h2>
          <p className="text-xs text-slate-400">Pilih sesi waktu untuk memfilter grafik</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl w-full sm:w-auto">
          {['Semua', 'Subuh', 'Ashar', 'Maghrib'].map((waktu) => (
            <button
              key={waktu}
              onClick={() => onFilterWaktu(waktu)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs transition-all ${
                selectedDashWaktu === waktu
                  ? 'font-bold bg-white text-emerald-900 shadow-sm'
                  : 'font-medium text-slate-500 hover:text-slate-700'
              }`}
            >
              {waktu}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-0.5 hover:shadow-md transition-all flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Musyrif</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">{musyrif.length}</span>
            <div className="text-emerald-600 bg-emerald-50 p-2 rounded-xl"><Users className="w-4 h-4" /></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-0.5 hover:shadow-md transition-all flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Hadir Hari Ini</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600">{hadirToday}</span>
            <div className="text-emerald-600 bg-emerald-50/50 p-2 rounded-xl"><CheckCheck className="w-4 h-4" /></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-0.5 hover:shadow-md transition-all flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Sakit / Izin</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-500">{sakitToday + izinToday}</span>
            <div className="text-amber-500 bg-amber-50 p-2 rounded-xl"><Info className="w-4 h-4" /></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-0.5 hover:shadow-md transition-all flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Alpa Hari Ini</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-rose-600">{alpaToday}</span>
            <div className="text-rose-600 bg-rose-50 p-2 rounded-xl"><UserX className="w-4 h-4" /></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-0.5 hover:shadow-md transition-all flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Disiplin</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-800">{attendanceRate}</span>
            <div className="text-emerald-800 bg-emerald-50 p-2 rounded-xl"><Percent className="w-4 h-4" /></div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1">Status Kehadiran Hari Ini</h3>
            <p className="text-xs text-slate-400">Filter Sesi: {selectedDashWaktu}</p>
          </div>
          <div className="py-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="#fff" strokeWidth={2}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1">Performa Kehadiran Tiap Musyrif</h3>
            <p className="text-xs text-slate-400">Rasio total persentase kehadiran (%) masing-masing asatidzah</p>
          </div>
          <div className="py-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="percent" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center space-x-2">
            <CheckCircle className="text-emerald-600 w-4 h-4" />
            <span>Informasi & Status Operasional Sistem</span>
          </h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-3.5 py-1.5 rounded-full font-semibold">
            {formatIndonesianDate(selectedDate)}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
            <CheckCircle className="text-emerald-600 w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-800">Sistem Libur Halaqoh</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Mengaktifkan status Libur untuk suatu sesi waktu akan mengunci formulir, dan tidak menurunkan persentase kehadiran.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
            <Lightbulb className="text-blue-500 w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-800">Rekap Jangka Waktu</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Gunakan submenu "Jangka Waktu" di tab Rekap Laporan untuk melacak performa asatidzah di antara dua tanggal khusus.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50 flex items-start space-x-3">
            <GraduationCap className="text-emerald-700 w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-emerald-800">Target Disiplin</h4>
              <p className="text-[11px] sm:text-xs text-emerald-700/80 mt-1">Perhitungan persentase dihitung adil hanya berdasarkan jumlah total sesi halaqah yang benar-benar aktif diselenggarakan.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
