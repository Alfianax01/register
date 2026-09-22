'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Lock,
  X
} from 'lucide-react';
import { UserAccount, Role } from '@/types';

export default function UsersManagementPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPwModalOpen, setIsResetPwModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // Form States - Add
  const [addForm, setAddForm] = useState({
    nama: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role_id: 'role_scanner',
    is_active: true
  });

  // Form States - Edit
  const [editForm, setEditForm] = useState({
    nama: '',
    email: '',
    role_id: '',
    is_active: true
  });

  // Form States - Reset Password
  const [resetPwForm, setResetPwForm] = useState({
    password: '',
    confirmPassword: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setRoles(data.roles || []);
      } else {
        showToast('Gagal memuat daftar pengguna.', { type: 'error' });
      }
    } catch {
      showToast('Terjadi kesalahan saat memuat data pengguna.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchQuery =
      u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter ? u.role_id === roleFilter : true;
    return matchQuery && matchRole;
  });

  // Handle Add User
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addForm.password !== addForm.confirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok.', { type: 'error' });
      return;
    }
    if (addForm.password.length < 6) {
      showToast('Kata sandi minimal 6 karakter.', { type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Pengguna "${addForm.nama}" berhasil ditambahkan.`, { type: 'success' });
        setIsAddModalOpen(false);
        setAddForm({
          nama: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          role_id: roles[0]?.id || 'role_scanner',
          is_active: true
        });
        fetchUsers();
      } else {
        showToast(data.error || 'Gagal menambahkan pengguna.', { type: 'error' });
      }
    } catch {
      showToast('Gagal menghubungi server.', { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (user: UserAccount) => {
    setSelectedUser(user);
    setEditForm({
      nama: user.nama,
      email: user.email,
      role_id: user.role_id,
      is_active: user.is_active
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Data pengguna "${selectedUser.username}" berhasil diperbarui.`, { type: 'success' });
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        showToast(data.error || 'Gagal memperbarui pengguna.', { type: 'error' });
      }
    } catch {
      showToast('Gagal menghubungi server.', { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Open Reset Password Modal
  const openResetPwModal = (user: UserAccount) => {
    setSelectedUser(user);
    setResetPwForm({ password: '', confirmPassword: '' });
    setIsResetPwModalOpen(true);
  };

  // Handle Reset Password Submit
  const handleResetPwSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (resetPwForm.password !== resetPwForm.confirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok.', { type: 'error' });
      return;
    }
    if (resetPwForm.password.length < 6) {
      showToast('Kata sandi minimal 6 karakter.', { type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPwForm.password })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Kata sandi untuk "${selectedUser.username}" berhasil direset.`, { type: 'success' });
        setIsResetPwModalOpen(false);
      } else {
        showToast(data.error || 'Gagal mereset kata sandi.', { type: 'error' });
      }
    } catch {
      showToast('Gagal menghubungi server.', { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (user: UserAccount) => {
    if (user.username === 'superadmin') {
      showToast('Akun Super Admin tidak boleh dinonaktifkan.', { type: 'info' });
      return;
    }

    const nextStatus = !user.is_active;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextStatus })
      });
      if (res.ok) {
        showToast(`Akun "${user.username}" ${nextStatus ? 'diaktifkan' : 'dinonaktifkan'}.`, { type: 'success' });
        fetchUsers();
      }
    } catch {
      showToast('Gagal mengubah status akun.', { type: 'error' });
    }
  };

  // Open Delete Modal
  const openDeleteModal = (user: UserAccount) => {
    if (user.username === 'superadmin') {
      showToast('Akun Super Admin utama tidak dapat dihapus.', { type: 'info' });
      return;
    }
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Handle Delete Submit
  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Akun "${selectedUser.username}" berhasil dihapus.`, { type: 'success' });
        setIsDeleteModalOpen(false);
        fetchUsers();
      } else {
        showToast(data.error || 'Gagal menghapus pengguna.', { type: 'error' });
      }
    } catch {
      showToast('Gagal menghubungi server.', { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Daftar Pengguna & Otorisasi"
        subtitle="Kelola akun dinas operasional, hak akses wewenang, dan keamanan sistem RAPIM TNI 2026."
        badge="USER AUTHORIZATION"
      />

      {/* Action Bar & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">Total Pengguna</span>
            <span className="text-2xl font-black text-[#1F2937]">{users.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 text-[#8B0000] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">Akun Aktif</span>
            <span className="text-2xl font-black text-emerald-600">
              {users.filter((u) => u.is_active).length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>
        <Card className="p-4 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">Grup Peran (Roles)</span>
            <span className="text-2xl font-black text-[#B8860B]">{roles.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#B8860B] flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Main Table Container */}
      <Card className="p-5 sm:p-6 bg-white border border-[#E5E7EB] rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, username, atau email dinas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-2 px-3 border border-[#D1D5DB] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] bg-white text-slate-700"
            >
              <option value="">Semua Peran</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              className="text-xs h-9 border-[#D1D5DB] hover:bg-slate-50"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              <span>Segarkan</span>
            </Button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="h-9 px-4 rounded-lg bg-[#8B0000] hover:bg-[#6B0000] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah User Baru</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch border border-[#E5E7EB] rounded-lg">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email Kedinasan</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Tanggal Dibuat</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-[#8B0000] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Memuat data pengguna dinas...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium">Tidak ada data pengguna yang sesuai pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#1F2937]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                          {u.nama.charAt(0)}
                        </div>
                        <span className="truncate max-w-[200px]" title={u.nama}>
                          {u.nama}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#6B7280]">{u.username}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#B8860B]/10 text-[#B8860B] border border-[#B8860B]/20">
                        {u.role_name || u.role_id}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        disabled={u.username === 'superadmin'}
                        title={u.username === 'superadmin' ? 'Akun superadmin selalu aktif' : 'Klik untuk ubah status'}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        } ${u.username === 'superadmin' ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                      >
                        {u.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          title="Edit Pengguna"
                          className="p-1.5 text-slate-600 hover:text-[#8B0000] hover:bg-slate-100 rounded-md transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openResetPwModal(u)}
                          title="Reset Password"
                          className="p-1.5 text-slate-600 hover:text-[#B8860B] hover:bg-slate-100 rounded-md transition"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        {u.username !== 'superadmin' && (
                          <button
                            onClick={() => openDeleteModal(u)}
                            title="Hapus Pengguna"
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========================================================= */}
      {/* MODAL TAMBAH USER BARU                                    */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-[#E5E7EB] shadow-2xl animate-modal-scale">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#1F2937]">Tambah Pengguna Dinas Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Mayor Czi Budi Santoso, S.T."
                  value={addForm.nama}
                  onChange={(e) => setAddForm({ ...addForm, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Username Login *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: panitiameja1"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Dinas
                  </label>
                  <input
                    type="email"
                    placeholder="petugas@tni.mil.id"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kata Sandi *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Konfirmasi Kata Sandi *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Ulangi kata sandi"
                    value={addForm.confirmPassword}
                    onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Peran (Role Akses) *
                </label>
                <select
                  value={addForm.role_id}
                  onChange={(e) => setAddForm({ ...addForm, role_id: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="add_is_active"
                  checked={addForm.is_active}
                  onChange={(e) => setAddForm({ ...addForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#8B0000] border-gray-300 rounded focus:ring-[#8B0000]"
                />
                <label htmlFor="add_is_active" className="text-xs font-medium text-slate-700 select-none cursor-pointer">
                  Akun Langsung Aktif dan Siap Digunakan Login
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#8B0000] hover:bg-[#6B0000] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs disabled:opacity-70"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL EDIT USER                                           */}
      {/* ========================================================= */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#E5E7EB] shadow-2xl animate-modal-scale">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#1F2937]">Edit Pengguna: {selectedUser.username}</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nama}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Dinas
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Peran (Role Akses) *
                </label>
                <select
                  value={editForm.role_id}
                  onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}
                  disabled={selectedUser.username === 'superadmin'}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {selectedUser.username === 'superadmin' && (
                  <p className="text-[11px] text-amber-600 mt-1">Role Super Admin utama terkunci demi keamanan sistem.</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  disabled={selectedUser.username === 'superadmin'}
                  className="w-4 h-4 text-[#8B0000] border-gray-300 rounded focus:ring-[#8B0000]"
                />
                <label htmlFor="edit_is_active" className="text-xs font-medium text-slate-700 select-none cursor-pointer">
                  Status Akun Aktif
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#8B0000] hover:bg-[#6B0000] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs disabled:opacity-70"
                >
                  {submitting ? 'Menyimpan...' : 'Perbarui Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL RESET PASSWORD                                      */}
      {/* ========================================================= */}
      {isResetPwModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#E5E7EB] shadow-2xl animate-modal-scale">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#B8860B] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#1F2937]">Reset Kata Sandi Akun</h3>
              </div>
              <button
                onClick={() => setIsResetPwModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Masukkan kata sandi baru untuk akun dinas: <strong className="text-slate-900">{selectedUser.nama} ({selectedUser.username})</strong>.
            </p>

            <form onSubmit={handleResetPwSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kata Sandi Baru *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={resetPwForm.password}
                  onChange={(e) => setResetPwForm({ ...resetPwForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Konfirmasi Kata Sandi Baru *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi kata sandi baru"
                  value={resetPwForm.confirmPassword}
                  onChange={(e) => setResetPwForm({ ...resetPwForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsResetPwModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#9B6A35] hover:bg-[#7B532A] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs disabled:opacity-70"
                >
                  {submitting ? 'Memproses...' : 'Ubah Kata Sandi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL HAPUS USER                                          */}
      {/* ========================================================= */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-[#E5E7EB] shadow-2xl animate-modal-scale text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Konfirmasi Hapus Akun</h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <strong className="text-slate-900">"{selectedUser.nama}" ({selectedUser.username})</strong>? Akun yang dihapus tidak akan dapat masuk kembali ke sistem.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-xs disabled:opacity-70"
              >
                {submitting ? 'Menghapus...' : 'Ya, Hapus Akun'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

