'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  Shield,
  ShieldCheck,
  Check,
  Save,
  RotateCw,
  Plus,
  Info,
  Lock,
  X
} from 'lucide-react';
import { Role, Permission, PermissionCode } from '@/types';

export default function RolesPermissionsPage() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  // Selected Role for Permission Matrix Editing
  const [activeRoleId, setActiveRoleId] = useState<string>('role_superadmin');
  const [rolePermissions, setRolePermissions] = useState<Record<string, PermissionCode[]>>({});

  // New Role Modal
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({ name: '', description: '' });
  const [submittingRole, setSubmittingRole] = useState(false);

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles || []);
        setPermissions(data.permissions || []);

        const initialMap: Record<string, PermissionCode[]> = {};
        (data.roles || []).forEach((r: Role) => {
          initialMap[r.id] = [...r.permissions];
        });
        setRolePermissions(initialMap);

        if (data.roles?.length > 0 && !activeRoleId) {
          setActiveRoleId(data.roles[0].id);
        }
      } else {
        showToast('Gagal memuat data peran dan hak akses.', { type: 'error' });
      }
    } catch {
      showToast('Gagal menghubungi server.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const activeRole = roles.find((r) => r.id === activeRoleId);
  const currentRolePerms = rolePermissions[activeRoleId] || [];

  const handleTogglePermission = (permCode: PermissionCode) => {
    if (activeRole?.id === 'role_superadmin') {
      showToast('Hak akses Super Admin selalu lengkap dan tidak dapat dikurangi.', { type: 'info' });
      return;
    }

    setRolePermissions((prev) => {
      const current = prev[activeRoleId] || [];
      const has = current.includes(permCode);
      const next = has ? current.filter((c) => c !== permCode) : [...current, permCode];
      return { ...prev, [activeRoleId]: next };
    });
  };

  const handleSelectAll = () => {
    if (activeRole?.id === 'role_superadmin') return;
    setRolePermissions((prev) => ({
      ...prev,
      [activeRoleId]: permissions.map((p) => p.code)
    }));
  };

  const handleClearAll = () => {
    if (activeRole?.id === 'role_superadmin') {
      showToast('Super Admin wajib memiliki seluruh hak akses.', { type: 'info' });
      return;
    }
    setRolePermissions((prev) => ({
      ...prev,
      [activeRoleId]: []
    }));
  };

  const handleSavePermissions = async () => {
    if (!activeRole) return;
    try {
      setSavingRoleId(activeRoleId);
      const res = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_id: activeRoleId,
          permissions: rolePermissions[activeRoleId] || []
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Hak akses peran "${activeRole.name}" berhasil disimpan.`, { type: 'success' });
        // Update local roles
        setRoles((prev) =>
          prev.map((r) => (r.id === activeRoleId ? { ...r, permissions: rolePermissions[activeRoleId] } : r))
        );
      } else {
        showToast(data.error || 'Gagal menyimpan hak akses.', { type: 'error' });
      }
    } catch {
      showToast('Gagal menghubungi server.', { type: 'error' });
    } finally {
      setSavingRoleId(null);
    }
  };

  // Create New Role Submit
  const handleAddRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) return;

    try {
      setSubmittingRole(true);
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleForm.name.trim(),
          description: newRoleForm.description.trim(),
          permissions: ['DASHBOARD']
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Peran baru "${newRoleForm.name}" berhasil dibuat.`, { type: 'success' });
        setIsAddRoleOpen(false);
        setNewRoleForm({ name: '', description: '' });
        await fetchRolesAndPermissions();
        if (data.role?.id) setActiveRoleId(data.role.id);
      } else {
        showToast(data.error || 'Gagal membuat peran baru.', { type: 'error' });
      }
    } catch {
      showToast('Gagal menghubungi server.', { type: 'error' });
    } finally {
      setSubmittingRole(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="User Group & Matriks Hak Akses"
        subtitle="Atur daftar wewenang otorisasi dinas dan hak akses menu per peran operasional."
        badge="USER AUTHORIZATION"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================= */}
        {/* KOLOM KIRI: DAFTAR PERAN (USER GROUPS)                    */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#8B0000]" />
                <span className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                  Daftar Grup Peran ({roles.length})
                </span>
              </div>
              <button
                onClick={() => setIsAddRoleOpen(true)}
                className="p-1.5 rounded-lg bg-[#8B0000]/10 text-[#8B0000] hover:bg-[#8B0000] hover:text-white transition text-xs font-bold flex items-center gap-1"
                title="Tambah Peran Baru"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {loading ? (
              <div className="py-6 text-center text-slate-400">
                <div className="w-5 h-5 border-2 border-[#8B0000] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Memuat daftar peran...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {roles.map((r) => {
                  const isActive = r.id === activeRoleId;
                  const permsCount = rolePermissions[r.id]?.length || 0;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setActiveRoleId(r.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1 ${
                        isActive
                          ? 'bg-[#8B0000]/5 border-[#8B0000] shadow-xs'
                          : 'bg-white border-[#E5E7EB] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isActive ? 'text-[#8B0000]' : 'text-slate-800'}`}>
                          {r.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {permsCount} Menu
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {r.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Catatan Keamanan */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex gap-2.5">
            <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Prinsip Hak Akses Terkecil (PoLP)</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Berikan hak akses hanya kepada menu yang benar-benar dibutuhkan oleh personil dinas terkait demi menjaga integritas data dan keamanan operasional.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* KOLOM KANAN: MATRIKS HAK AKSES PER MENU                   */}
        {/* ========================================================= */}
        <div className="lg:col-span-8">
          <Card className="p-5 sm:p-6 bg-white border border-[#E5E7EB] rounded-xl shadow-xs">
            {activeRole ? (
              <div>
                {/* Header Matriks */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-[#E5E7EB] gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#1F2937]">{activeRole.name}</h3>
                      {activeRole.is_system && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          Bawaan Sistem
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{activeRole.description}</p>
                  </div>

                  {activeRole.id !== 'role_superadmin' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-xs font-semibold text-[#8B0000] hover:underline px-2 py-1"
                      >
                        Pilih Semua
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-2 py-1"
                      >
                        Kosongkan
                      </button>
                    </div>
                  )}
                </div>

                {/* List Matriks Hak Akses */}
                <div className="space-y-3 mb-6">
                  {permissions.map((perm) => {
                    const isChecked = currentRolePerms.includes(perm.code);
                    const isSuper = activeRole.id === 'role_superadmin';

                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-3 p-3.5 rounded-lg border transition cursor-pointer select-none ${
                          isChecked
                            ? 'bg-[#B8860B]/5 border-[#B8860B]/40'
                            : 'bg-white border-[#E5E7EB] hover:bg-slate-50'
                        } ${isSuper ? 'cursor-default' : ''}`}
                      >
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isSuper}
                            onChange={() => handleTogglePermission(perm.code)}
                            className="w-4 h-4 text-[#8B0000] border-gray-300 rounded focus:ring-[#8B0000]"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-bold text-[#1F2937]">
                              {perm.name}
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {perm.code}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {perm.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Tombol Simpan */}
                <div className="flex items-center justify-end pt-4 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={savingRoleId === activeRoleId || activeRole.id === 'role_superadmin'}
                    className="h-10 px-6 rounded-lg bg-[#8B0000] hover:bg-[#6B0000] text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingRoleId === activeRoleId ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Hak Akses Peran</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Shield className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">Pilih salah satu peran di panel kiri untuk mengatur hak akses.</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL BUAT PERAN BARU                                     */}
      {/* ========================================================= */}
      {isAddRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#E5E7EB] shadow-2xl animate-modal-scale">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8B0000]" />
                <h3 className="text-base font-bold text-[#1F2937]">Tambah Grup Peran Baru</h3>
              </div>
              <button
                onClick={() => setIsAddRoleOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Grup Peran *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Petugas Protokoler"
                  value={newRoleForm.name}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi Tanggung Jawab
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan ruang lingkup wewenang dinas peran ini..."
                  value={newRoleForm.description}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsAddRoleOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingRole}
                  className="px-5 py-2 rounded-lg bg-[#8B0000] hover:bg-[#6B0000] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs disabled:opacity-70"
                >
                  {submittingRole ? 'Membuat...' : 'Buat Grup Peran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

