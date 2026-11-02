import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiUserCircle,
  HiShieldCheck,
  HiEnvelope,
  HiBuildingOffice2,
  HiSquares2X2,
  HiCheckCircle,
} from 'react-icons/hi2';
import { updateProfile } from '../redux/slices/authSlice';

export const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, memberships } = useSelector((state) => state.auth);

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff&bold=true&rounded=true`;

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || defaultAvatar);
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState(false);

  const AVATAR_PRESETS = [
    {
      label: 'Initials (Indigo)',
      url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=4f46e5&color=fff&bold=true&rounded=true`,
    },
    {
      label: 'Initials (Cyan)',
      url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0284c7&color=fff&bold=true&rounded=true`,
    },
    {
      label: 'Initials (Emerald)',
      url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=059669&color=fff&bold=true&rounded=true`,
    },
    {
      label: 'Professional Male 1',
      url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
    {
      label: 'Professional Male 2',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      label: 'Professional Male 3',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await dispatch(updateProfile({ name: name.trim(), avatar })).unwrap();
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <HiUserCircle className="w-6 h-6 text-indigo-400" />
          User Profile & Role Entitlements
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal details and view your multi-tenant organization assignments
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <img
            src={avatar || defaultAvatar}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl bg-indigo-600 border-2 border-indigo-500/40 object-cover shadow-lg"
          />
          <div>
            <h2 className="text-lg font-bold text-white">{user?.name}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <HiEnvelope className="w-4 h-4 text-slate-500" />
              {user?.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Profile Avatar
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {AVATAR_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(p.url)}
                  className={`flex flex-col items-center p-2 rounded-xl border transition ${
                    avatar === p.url
                      ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <img src={p.url} alt={p.label} className="w-10 h-10 rounded-xl object-cover mb-1.5" />
                  <span className="text-[10px] text-slate-400 text-center truncate w-full">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Or Custom Avatar URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address (Immutable)
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-2 text-sm text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {successMsg ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <HiCheckCircle className="w-4 h-4" />
                Profile updated successfully!
              </span>
            ) : (
              <span></span>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition shadow-md shadow-indigo-600/30"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <HiShieldCheck className="w-5 h-5 text-indigo-400" />
          Active Memberships & Assigned Roles
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Organizations and tenant branches where you have access permissions
        </p>

        <div className="space-y-3">
          {memberships?.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No memberships recorded.</p>
          ) : (
            memberships.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
                    <HiBuildingOffice2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">
                      {m.organizationId?.name || 'Organization'}
                    </h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <HiSquares2X2 className="w-3.5 h-3.5 text-cyan-400" />
                      Branch: {m.tenantId?.name || 'All Branches (Org-wide)'}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-indigo-300 border border-slate-700">
                  {m.role}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
