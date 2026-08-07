import React, { useState } from 'react';
import { CalendarCheck, CloudUpload, Coffee, Loader2, RotateCcw, TriangleAlert, Users } from 'lucide-react';
import { AppState, Musyrif } from '../types';
import { formatIndonesianDate } from '../lib/utils';
import { submitAttendanceApi, submitHolidayApi } from '../lib/api';

interface InputAbsensiProps {
  appState: AppState;
  onDateChange: (d: string) => void;
  onWaktuChange: (w: string) => void;
  onSuccess: () => void;
}

export default function InputAbsensi({ appState, onDateChange, onWaktuChange, onSuccess }: InputAbsensiProps) {
  const { musyrif, logs, selectedDate, selectedWaktu } = appState;
  const [submitting, setSubmitting] = useState(false);
  const [holidayToggling, setHolidayToggling] = useState(false);

  const logsHariIniSesi = logs.filter((l) => l.tanggal === selectedDate && l.waktu === selectedWaktu);
  const isHoliday = logsHariIniSesi.some((l) => l.status === 'L');

  const handleToggleHoliday = async () => {
    if (!window.confirm(`Apakah Anda yakin ingin ${isHoliday ? 'mengaktifkan kembali' : 'meliburkan'} sesi ${selectedWaktu} tanggal ${formatIndonesianDate(selectedDate)}?`)) {
      return;
    }
    setHolidayToggling(true);
    try {
      await submitHolidayApi(selectedDate, selectedWaktu, !isHoliday, musyrif);
      onSuccess();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setHolidayToggling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isHoliday) {
      alert('Sesi diliburkan.');
      return;
    }

    const form = e.currentTarget;
    const records = [];

    for (const m of musyrif) {
      const statusInput = form.elements.namedItem(`status-${m.id}`) as RadioNodeList;
      const catatanInput = form.elements.namedItem(`catatan-${m.id}`) as HTMLInputElement;
      
      const status = statusInput.value;
      if (status) {
        records.push({ id: m.id, nama: m.nama, status, catatan: catatanInput.value });
      }
    }

    if (records.length < musyrif.length) {
      alert('Harap isi status seluruh musyrif!');
      return;
    }

    setSubmitting(true);
    try {
      await submitAttendanceApi(selectedDate, selectedWaktu, records);
      onSuccess();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-900 px-6 py-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold">Formulir Absensi Musyrif</h3>
            <p className="text-xs text-emerald-200 mt-0.5">Pilih tanggal dan sesi waktu halaqah</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-emerald-200">Tanggal:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl px-3 py-2 border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-emerald-200">Sesi:</label>
              <select
                value={selectedWaktu}
                onChange={(e) => onWaktuChange(e.target.value)}
                className="bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl px-3 py-2 border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                <option value="Subuh">Subuh</option>
                <option value="Ashar">Ashar</option>
                <option value="Maghrib">Maghrib</option>
              </select>
            </div>
          </div>
        </div>

        {/* Holiday Panel */}
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`p-3.5 rounded-2xl ${isHoliday ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {isHoliday ? <Coffee className="w-6 h-6" /> : <CalendarCheck className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Operasional Sesi</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${isHoliday ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                  <span className="text-sm sm:text-base font-bold text-slate-800">
                    {isHoliday ? 'Sesi Diliburkan (Libur Halaqoh)' : 'Sesi Aktif Normal'}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleHoliday}
              disabled={holidayToggling}
              className={`w-full md:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition shadow-md text-white ${
                isHoliday ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'
              } disabled:opacity-50`}
            >
              {holidayToggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isHoliday ? (
                <RotateCcw className="w-4 h-4" />
              ) : (
                <Coffee className="w-4 h-4" />
              )}
              <span>{holidayToggling ? 'Memproses...' : isHoliday ? 'Batalkan Libur Sesi Ini' : 'Liburkan Sesi Halaqoh Ini'}</span>
            </button>
          </div>
        </div>

        {isHoliday && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center space-x-3 text-amber-800 text-xs sm:text-sm font-semibold">
            <TriangleAlert className="w-5 h-5 text-amber-600 animate-bounce shrink-0" />
            <div>Sesi ini telah diliburkan (Libur Halaqoh). Form pengisian ditutup, dan sesi tidak dihitung di statistik kehadiran musyrif.</div>
          </div>
        )}

        {/* Form List */}
        <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
          <div className="divide-y divide-slate-100">
            {musyrif.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Tidak ada data Musyrif yang terdaftar.</p>
              </div>
            ) : (
              musyrif.map((m) => {
                const log = logsHariIniSesi.find((l) => l.id === m.id);
                return (
                  <div key={m.id} className="px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 transition hover:bg-slate-50/70">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 rounded px-2 py-0.5">{m.id}</span>
                        <h4 className="text-base font-semibold text-slate-800 truncate">{m.nama}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{m.halaqah}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer">
                        <input type="radio" name={`status-${m.id}`} value="H" defaultChecked={log?.status === 'H'} disabled={isHoliday} className="peer sr-only" required />
                        <span className="flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 peer-checked:border-emerald-600 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-disabled:opacity-50 transition">
                          Hadir
                        </span>
                      </label>
                      <label className="cursor-pointer">
                        <input type="radio" name={`status-${m.id}`} value="S" defaultChecked={log?.status === 'S'} disabled={isHoliday} className="peer sr-only" />
                        <span className="flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-800 peer-disabled:opacity-50 transition">
                          Sakit
                        </span>
                      </label>
                      <label className="cursor-pointer">
                        <input type="radio" name={`status-${m.id}`} value="I" defaultChecked={log?.status === 'I'} disabled={isHoliday} className="peer sr-only" />
                        <span className="flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-800 peer-disabled:opacity-50 transition">
                          Izin
                        </span>
                      </label>
                      <label className="cursor-pointer">
                        <input type="radio" name={`status-${m.id}`} value="A" defaultChecked={log?.status === 'A'} disabled={isHoliday} className="peer sr-only" />
                        <span className="flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-600 peer-checked:border-rose-600 peer-checked:bg-rose-50 peer-checked:text-rose-700 peer-disabled:opacity-50 transition">
                          Alpa
                        </span>
                      </label>
                    </div>

                    <div className="w-full lg:max-w-xs">
                      <input
                        type="text"
                        name={`catatan-${m.id}`}
                        defaultValue={log?.catatan || ''}
                        disabled={isHoliday}
                        placeholder={isHoliday ? 'Libur Halaqoh' : 'Tulis alasan...'}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="px-6 py-5 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 text-center sm:text-left flex items-center">
              <TriangleAlert className="text-amber-500 w-4 h-4 mr-1 inline-block" />
              Penyimpanan pada sesi yang sama menimpa data sebelumnya.
            </div>
            <button
              type="submit"
              disabled={isHoliday || submitting}
              className={`w-full sm:w-auto font-semibold text-sm px-6 py-3.5 rounded-xl shadow-md transition flex items-center justify-center space-x-2 ${
                isHoliday || submitting ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-600 text-white hover:shadow-lg'
              }`}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
              <span>{submitting ? 'Menyimpan...' : 'Simpan Absensi'}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
