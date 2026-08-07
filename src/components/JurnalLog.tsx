import React, { useState } from 'react';
import { FolderOpen, Search } from 'lucide-react';
import { AppState } from '../types';
import { formatIndonesianDate } from '../lib/utils';

export default function JurnalLog({ appState }: { appState: AppState }) {
  const { logs } = appState;
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [waktuFilter, setWaktuFilter] = useState('');

  const sortedLogs = [...logs].sort((a, b) => {
    const diff = new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
    if (diff !== 0) return diff;
    const order: Record<string, number> = { 'Subuh': 1, 'Ashar': 2, 'Maghrib': 3 };
    return (order[a.waktu] || 0) - (order[b.waktu] || 0);
  });

  const filteredLogs = sortedLogs.filter(l => {
    if (search && !l.nama.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFilter && l.tanggal !== dateFilter) return false;
    if (waktuFilter && l.waktu !== waktuFilter) return false;
    return true;
  });

  return (
    <section className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Jurnal Riwayat Log Sesi</h3>
            <p className="text-xs text-slate-400 mt-0.5">Daftar rekaman mentah kehadiran</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-slate-200 rounded-xl text-xs sm:text-sm px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={waktuFilter}
              onChange={(e) => setWaktuFilter(e.target.value)}
              className="border border-slate-200 rounded-xl text-xs sm:text-sm px-3.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Semua Sesi</option>
              <option value="Subuh">Subuh</option>
              <option value="Ashar">Ashar</option>
              <option value="Maghrib">Maghrib</option>
            </select>
            <div className="relative max-w-xs w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari Ustadz..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-100">
                <th className="py-4 px-6">Tanggal</th>
                <th className="py-4 px-6">Sesi</th>
                <th className="py-4 px-6">Nama</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6">Catatan</th>
                <th className="py-4 px-6 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">Tidak ada riwayat ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-semibold text-slate-700">{formatIndonesianDate(l.tanggal)}</td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                        {l.waktu}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">{l.nama}</td>
                    <td className="py-4 px-6 text-center">
                      {l.status === 'H' && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Hadir</span>}
                      {l.status === 'S' && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Sakit</span>}
                      {l.status === 'I' && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Izin</span>}
                      {l.status === 'A' && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">Alpa</span>}
                      {l.status === 'L' && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500 text-white">Libur</span>}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs italic">{l.catatan || '-'}</td>
                    <td className="py-4 px-6 text-right text-slate-400 text-xs">{l.timestamp || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
