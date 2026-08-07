import React from 'react';
import { Calendar, CalendarDays, CalendarRange, Printer } from 'lucide-react';
import { AppState } from '../types';
import { formatIndonesianDate, formatShortDate } from '../lib/utils';

interface Props {
  appState: AppState;
  onSetState: (update: Partial<AppState>) => void;
}

export default function RekapLaporan({ appState, onSetState }: Props) {
  const { rekapType, rekapSelectedDate, rekapSelectedWaktu, rekapStartDate, rekapEndDate, musyrif, logs } = appState;

  const renderTabs = () => (
    <div className="flex flex-wrap items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
      {[
        { id: 'harian', label: 'Harian', icon: Calendar },
        { id: 'mingguan', label: 'Mingguan', icon: CalendarDays },
        { id: 'bulanan', label: 'Bulanan', icon: CalendarRange },
        { id: 'kustom', label: 'Jangka Waktu', icon: CalendarRange },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSetState({ rekapType: tab.id })}
          className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-2 ${
            rekapType === tab.id
              ? 'font-bold bg-white text-emerald-900 shadow-sm'
              : 'font-medium text-slate-500 hover:text-slate-800'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  const renderFilters = () => {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {rekapType !== 'harian' && (
          <>
            <label className="text-xs font-semibold text-slate-500">Filter Sesi:</label>
            <select
              value={rekapSelectedWaktu}
              onChange={(e) => onSetState({ rekapSelectedWaktu: e.target.value })}
              className="border border-slate-200 rounded-xl text-xs sm:text-sm px-3.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Semua">Semua Sesi</option>
              <option value="Subuh">Subuh</option>
              <option value="Ashar">Ashar</option>
              <option value="Maghrib">Maghrib</option>
            </select>
          </>
        )}
        
        {(rekapType === 'harian' || rekapType === 'mingguan') && (
          <>
            <label className="text-xs font-semibold text-slate-500">Tanggal:</label>
            <input
              type="date"
              value={rekapSelectedDate}
              onChange={(e) => onSetState({ rekapSelectedDate: e.target.value })}
              className="border border-slate-200 rounded-xl text-xs sm:text-sm px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </>
        )}

        {rekapType === 'bulanan' && (
          <>
            <label className="text-xs font-semibold text-slate-500">Bulan & Tahun:</label>
            <input
              type="month"
              value={rekapSelectedDate.substring(0, 7)}
              onChange={(e) => onSetState({ rekapSelectedDate: e.target.value + '-01' })}
              className="border border-slate-200 rounded-xl text-xs sm:text-sm px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </>
        )}

        {rekapType === 'kustom' && (
          <>
            <label className="text-xs font-semibold text-slate-500">Dari:</label>
            <input
              type="date"
              value={rekapStartDate}
              onChange={(e) => onSetState({ rekapStartDate: e.target.value })}
              className="border border-slate-200 rounded-xl text-xs sm:text-sm px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <label className="text-xs font-semibold text-slate-500">Sampai:</label>
            <input
              type="date"
              value={rekapEndDate}
              onChange={(e) => onSetState({ rekapEndDate: e.target.value })}
              className="border border-slate-200 rounded-xl text-xs sm:text-sm px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </>
        )}
      </div>
    );
  };

  const getBadge = (status?: string) => {
    switch(status) {
      case 'H': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Hadir</span>;
      case 'S': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Sakit</span>;
      case 'I': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Izin</span>;
      case 'A': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Alpa</span>;
      case 'L': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500 text-white">Libur</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400">Belum</span>;
    }
  };

  return (
    <section className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        {renderTabs()}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end print:hidden">
          {renderFilters()}
          <button onClick={() => window.print()} className="bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md">
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {rekapType === 'harian' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print-mt-0">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Laporan Kehadiran Harian (3 Sesi)</h3>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full font-bold">
              {formatIndonesianDate(rekapSelectedDate)}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-100">
                  <th className="py-4 px-6 text-center w-12">No</th>
                  <th className="py-4 px-6">Nama Musyrif</th>
                  <th className="py-4 px-4 text-center">Subuh</th>
                  <th className="py-4 px-4 text-center">Ashar</th>
                  <th className="py-4 px-4 text-center">Maghrib</th>
                  <th className="py-4 px-6">Catatan Hari Ini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {musyrif.map((m) => {
                  const mLogs = logs.filter(l => l.tanggal === rekapSelectedDate && l.id === m.id);
                  const s = mLogs.find(l => l.waktu === 'Subuh');
                  const a = mLogs.find(l => l.waktu === 'Ashar');
                  const mg = mLogs.find(l => l.waktu === 'Maghrib');
                  const cat = [s,a,mg].filter(l => l?.catatan).map(l => `${l?.waktu}: ${l?.catatan}`).join(' | ') || '-';
                  
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6 text-center text-slate-400">{m.no}</td>
                      <td className="py-4 px-6 font-semibold">
                        <div>{m.nama}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{m.halaqah}</span>
                      </td>
                      <td className="py-4 px-4 text-center">{getBadge(s?.status)}</td>
                      <td className="py-4 px-4 text-center">{getBadge(a?.status)}</td>
                      <td className="py-4 px-4 text-center">{getBadge(mg?.status)}</td>
                      <td className="py-4 px-6 text-slate-500 italic text-xs max-w-xs truncate">{cat}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(rekapType === 'bulanan' || rekapType === 'kustom') && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Rekapitulasi Kehadiran</h3>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full font-bold">
              {rekapType === 'bulanan' ? new Date(rekapSelectedDate).toLocaleDateString('id-ID', {month: 'long', year:'numeric'}) : `${formatShortDate(rekapStartDate)} - ${formatShortDate(rekapEndDate)}`}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-100">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Nama</th>
                  <th className="py-4 px-6 text-center text-emerald-600">Hadir</th>
                  <th className="py-4 px-6 text-center text-amber-500">Sakit</th>
                  <th className="py-4 px-6 text-center text-blue-500">Izin</th>
                  <th className="py-4 px-6 text-center text-rose-600">Alpa</th>
                  <th className="py-4 px-6 text-right">% Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {musyrif.map((m) => {
                  let activeLogs = logs.filter(l => l.id === m.id && l.status !== 'L');
                  
                  if (rekapSelectedWaktu !== 'Semua') {
                    activeLogs = activeLogs.filter(l => l.waktu === rekapSelectedWaktu);
                  }

                  if (rekapType === 'bulanan') {
                    const d = new Date(rekapSelectedDate);
                    activeLogs = activeLogs.filter(l => new Date(l.tanggal).getMonth() === d.getMonth() && new Date(l.tanggal).getFullYear() === d.getFullYear());
                  } else {
                    activeLogs = activeLogs.filter(l => l.tanggal >= rekapStartDate && l.tanggal <= rekapEndDate);
                  }

                  const h = activeLogs.filter(l => l.status === 'H').length;
                  const s = activeLogs.filter(l => l.status === 'S').length;
                  const i = activeLogs.filter(l => l.status === 'I').length;
                  const a = activeLogs.filter(l => l.status === 'A').length;
                  const pct = activeLogs.length > 0 ? Math.round((h / activeLogs.length) * 100) : 0;
                  
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6"><span className="bg-slate-100 font-bold px-2 py-1 rounded text-xs text-slate-600">{m.id}</span></td>
                      <td className="py-4 px-6 font-semibold">{m.nama}</td>
                      <td className="py-4 px-6 text-center font-bold text-emerald-600 bg-emerald-50/20">{h}</td>
                      <td className="py-4 px-6 text-center font-bold text-amber-500">{s}</td>
                      <td className="py-4 px-6 text-center font-bold text-blue-500">{i}</td>
                      <td className="py-4 px-6 text-center font-bold text-rose-600 bg-rose-50/20">{a}</td>
                      <td className="py-4 px-6 text-right font-bold text-emerald-700">{pct}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
