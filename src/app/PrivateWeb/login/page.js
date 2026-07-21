"use client";

import Image from "next/image";
import { API_URL } from "@/lib/config";
import { apiFetch } from "@/lib/api";
import '@/styles/globals.css';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiEye, HiEyeOff, HiUserGroup, HiPencilAlt, HiUserCircle, HiChevronDown, HiMail, HiLockClosed, HiArrowRight } from "react-icons/hi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showRole, setShowRole] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Daftar role yang tersedia
  const roles = [
    { key: "admin", label: "Panitia", icon: HiUserGroup },
    { key: "penguji", label: "Penguji", icon: HiPencilAlt },
    { key: "pengasuh", label: "Pengasuh", icon: HiUserCircle },
  ];

  // Fungsi untuk mendapatkan teks yang ditampilkan pada dropdown berdasarkan role yang dipilih
  const getRoleDisplayText = () => {
    if (!role) return "Pilih Role Anda";
    const selectedRole = roles.find((r) => r.key === role);
    return selectedRole ? selectedRole.label : "Pilih Role Anda";
  };

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !email.includes("@")) {
      setError("Email tidak valid");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Password tidak boleh kosong");
      setLoading(false);
      return;
    }

    if (!role) {
      setError("Silakan pilih role terlebih dahulu");
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch('/api/private/login', {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        setLoading(false);
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("private_session", JSON.stringify(data.user));
      localStorage.setItem("private_user", JSON.stringify(data.user));

      router.push(`/PrivateWeb/${role}`);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Green Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-green-700 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md text-center">
          {/* Logo Container */}
          <div className="mb-8 flex justify-center">
            <div className="w-40 h-40 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center p-4">
              <Image
                src="/images/IllustratorLoading.png"
                alt="Logo Pondok"
                width={120}
                height={120}
                priority
                className="object-contain"
              />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold mb-4 leading-tight">
            Pendaftaran Santri Baru<br />
            Pondok Pesantren Delima<br />
            Tanjung Rejo
          </h1>
          
          {/* Description */}
          <p className="text-green-100 text-sm leading-relaxed">
            Mengantarkan manusia unggul dengan mengedepankan keluhuran akhlak, cerdas berilmu, dan bijak beramal.
          </p>
        </div>
      </div>

      {/* Right Side - White Background */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Masuk ke Akun Private
            </h2>
            <p className="text-gray-500 text-sm">
              Silakan masukkan email, kata sandi, pilih role Anda untuk masuk ke sistem.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email Aktif
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan Email Aktif Anda"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiLockClosed className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 karakter"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <HiEyeOff className="w-5 h-5" />
                  ) : (
                    <HiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Role Dropdown */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Role
              </label>
              <button
                type="button"
                onClick={() => setShowRole(!showRole)}
                className={`w-full px-4 py-3 border rounded-xl flex justify-between items-center transition-all ${
                  role
                    ? "border-gray-300 bg-white hover:border-green-500"
                    : "border-gray-200 bg-gray-50 hover:border-green-400"
                }`}
              >
                <span
                  className={`${role ? "text-gray-900" : "text-gray-500"}`}
                >
                  {getRoleDisplayText()}
                </span>
                <HiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showRole ? 'rotate-180' : ''}`} />
              </button>

              {showRole && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {roles.map((r) => {
                    const IconComponent = r.icon;
                    return (
                      <div
                        key={r.key}
                        onClick={() => {
                          setRole(r.key);
                          setShowRole(false);
                        }}
                        className={`px-4 py-3 cursor-pointer hover:bg-green-50 flex items-center gap-3 transition-colors ${
                          role === r.key
                            ? "bg-green-100 font-medium text-green-800"
                            : "text-gray-700"
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        {r.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-700/20"
            >
              {loading ? (
                "Loading..."
              ) : (
                <>
                  Masuk
                  <HiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}