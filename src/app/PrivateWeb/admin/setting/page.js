"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { getAuthToken, getPrivateSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import PrivateHeader from "@/components/PrivateHeader";
import { HiSave, HiTrash, HiPlus } from "react-icons/hi";

export default function SettingPage() {
  const [settings, setSettings] = useState({});
  const [biayaList, setBiayaList] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!getAuthToken()) {
          router.replace("/PrivateWeb/login");
          return;
        }
        const session = getPrivateSession();
        if (!session || session.role !== "admin") {
          router.replace("/PrivateWeb/login");
          return;
        }

        const res = await apiFetch('/api/settings');
        if (!res.ok) throw new Error('Gagal memuat pengaturan');
        const result = await res.json();
        setSettings(result.data || {});

        const biayaYears = [];
        const currentYear = new Date().getFullYear();
        for (let y = currentYear - 1; y <= currentYear + 3; y++) {
          biayaYears.push(y);
        }

        const biayaPromises = biayaYears.map(async (year) => {
          try {
            const biayaRes = await apiFetch(`/api/settings/biaya/${year}`);
            if (biayaRes.ok) {
              const biayaData = await biayaRes.json();
              return [year, biayaData.biaya || 0];
            }
          } catch (e) {
            console.error(`Failed to fetch biaya for ${year}`, e);
          }
          return [year, 0];
        });

        const biayaResults = await Promise.all(biayaPromises);
        const biayaMap = {};
        biayaResults.forEach(([year, biaya]) => {
          biayaMap[year] = biaya;
        });
        setBiayaList(biayaMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [router]);

  const handleSaveSetting = async (key, value) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiFetch(`/api/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menyimpan');
      }
      setSettings(prev => ({ ...prev, [key]: value }));
      setSuccess('Pengaturan berhasil disimpan');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBiaya = async (year, biaya) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiFetch(`/api/settings/biaya_${year}`, {
        method: 'PUT',
        body: JSON.stringify({ value: biaya }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menyimpan biaya');
      }
      setBiayaList(prev => ({ ...prev, [year]: biaya }));
      setSuccess('Biaya pendaftaran berhasil disimpan');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PrivateHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat pengaturan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && Object.keys(settings).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PrivateHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-bold text-xl mb-2">Terjadi Kesalahan</p>
            <p className="text-gray-600 text-sm mt-1 mb-6">{error}</p>
            <button onClick={() => router.back()} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentYear = settings.active_year || new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50">
      <PrivateHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-700 hover:text-green-600 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold">Kembali</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-600">Kelola tahun pendaftaran dan biaya</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tahun Pendaftaran</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tahun Aktif</label>
              <input
                type="number"
                value={settings.active_year || currentYear}
                onChange={(e) => setSettings(prev => ({ ...prev, active_year: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Contoh: 2025"
              />
            </div>
            <div className="pt-6">
              <button
                onClick={() => handleSaveSetting('active_year', settings.active_year || currentYear)}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <HiSave className="w-5 h-5" />
                Simpan
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Tahun ini akan menentukan data mana yang ditampilkan di Dashboard, Statistik, Laporan, dan Jumlah Santri.</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Biaya Pendaftaran</h2>
          <div className="space-y-4">
            {Object.keys(biayaList).sort().map((year) => (
              <div key={year} className="flex items-center gap-4">
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700">{year}</label>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={biayaList[year]}
                    onChange={(e) => setBiayaList(prev => ({ ...prev, [year]: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Nominal biaya"
                  />
                </div>
                <button
                  onClick={() => handleSaveBiaya(year, biayaList[year])}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <HiSave className="w-5 h-5" />
                  Simpan
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Biaya ini akan otomatis diterapkan pada saat pembayaran dan ditampilkan pada kwitansi.</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tanda Tangan Laporan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Panitia</label>
              <input
                type="text"
                value={settings.panitia_nama || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, panitia_nama: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Nama Panitia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan Panitia</label>
              <input
                type="text"
                value={settings.panitia_jabatan || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, panitia_jabatan: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Jabatan Panitia"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => {
                handleSaveSetting('panitia_nama', settings.panitia_nama || '');
                handleSaveSetting('panitia_jabatan', settings.panitia_jabatan || '');
              }}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <HiSave className="w-5 h-5" />
              Simpan Tanda Tangan
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
