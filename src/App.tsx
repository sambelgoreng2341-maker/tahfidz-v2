import { useEffect, useState } from 'react';
import { BookOpen, CalendarCheck, Loader2, PieChart, RefreshCw, Table2 } from 'lucide-react';
import { AppState } from './types';
import { fetchDataApi } from './lib/api';
import { getLocalDateString, getSevenDaysAgoString, suggestSesiWaktu } from './lib/utils';

import Dashboard from './components/Dashboard';
import InputAbsensi from './components/InputAbsensi';
import RekapLaporan from './components/RekapLaporan';
import JurnalLog from './components/JurnalLog';

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    musyrif: [],
    logs: [],
    selectedDate: getLocalDateString(),
    selectedWaktu: suggestSesiWaktu(),
    selectedDashWaktu: 'Semua',
    currentTab: 'dashboard',
    rekapType: 'harian',
    rekapSelectedDate: getLocalDateString(),
    rekapSelectedWaktu: 'Semua',
    rekapStartDate: getSevenDaysAgoString(),
    rekapEndDate: getLocalDateString(),
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const { response, isSimulated } = await fetchDataApi();
      setIsSimulated(isSimulated);
      if (response.success && response.musyrif && response.logs) {
        setAppState(prev => ({
          ...prev,
          musyrif: response.musyrif!,
          logs: response.logs!,
        }));
      } else {
        setError(response.message || 'Failed to load data');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSetState = (update: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...update }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-700/80 p-2 rounded-xl border border-emerald-600/30">
                <BookOpen className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight">E-Absensi Musyrif</h1>
                <p className="text-[10px] sm:text-xs text-emerald-300">Tahfidz & Halaqah 3 Sesi</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => loadData(true)}
                disabled={refreshing || loading}
                className="flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all focus:outline-none ring-1 ring-emerald-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Refresh Data</span>
              </button>
              <div className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl font-medium border text-[10px] sm:text-xs ${isSimulated ? 'bg-amber-950/60 text-amber-300 border-amber-800' : 'bg-emerald-950/65 text-emerald-300 border-emerald-800'}`}>
                <span className={`h-2 w-2 rounded-full animate-pulse ${isSimulated ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span>{isSimulated ? 'Mode Simulasi' : 'Google Sheets Aktif'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Nav */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-6 sm:space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard Laporan', icon: PieChart },
              { id: 'input', label: 'Input Absensi', icon: CalendarCheck },
              { id: 'rekap', label: 'Rekap Laporan', icon: Table2 },
              { id: 'jurnal', label: 'Jurnal Log', icon: BookOpen },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleSetState({ currentTab: tab.id })}
                className={`py-4 px-1 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center space-x-2 transition-all border-b-2 ${
                  appState.currentTab === tab.id
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-slate-500 text-sm font-medium">Sinkronisasi Basis Data...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center">
            <h3 className="font-bold text-lg mb-2">Gagal Memuat Data</h3>
            <p className="text-sm">{error}</p>
            <button onClick={() => loadData()} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-500">Coba Lagi</button>
          </div>
        ) : (
          <>
            {appState.currentTab === 'dashboard' && (
              <Dashboard appState={appState} onFilterWaktu={(w) => handleSetState({ selectedDashWaktu: w })} />
            )}
            {appState.currentTab === 'input' && (
              <InputAbsensi 
                appState={appState} 
                onDateChange={(d) => handleSetState({ selectedDate: d })} 
                onWaktuChange={(w) => handleSetState({ selectedWaktu: w })}
                onSuccess={() => loadData(true)}
              />
            )}
            {appState.currentTab === 'rekap' && (
              <RekapLaporan appState={appState} onSetState={handleSetState} />
            )}
            {appState.currentTab === 'jurnal' && (
              <JurnalLog appState={appState} />
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Pesantren & Tahfidz Quran Center. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
