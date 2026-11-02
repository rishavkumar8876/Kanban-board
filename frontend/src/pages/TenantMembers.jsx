import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  HiUsers,
  HiUserPlus,
  HiShieldCheck,
  HiTrash,
  HiEnvelope,
} from 'react-icons/hi2';
import {
  fetchTenantMembers,
  addTenantMember,
  updateMemberRole,
  removeTenantMember,
} from '../redux/slices/tenantSlice';

export const TenantMembers = () => {
  const dispatch = useDispatch();

  const { currentOrgId, currentTenantId, userRole, user: currentUser } = useSelector(
    (state) => state.auth
  );
  const { organizations } = useSelector((state) => state.organizations);
  const { tenants, members, loading } = useSelector((state) => state.tenants);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (currentTenantId) {
      dispatch(fetchTenantMembers(currentTenantId));
    }
  }, [dispatch, currentTenantId]);

  const activeOrg = organizations.find((o) => o._id === currentOrgId);
  const isOrgAdmin =
    userRole === 'org_admin' ||
    activeOrg?.userRole === 'org_admin' ||
    (organizations.length > 0 && organizations[0]._id === currentOrgId && organizations[0].userRole === 'org_admin');
  const canManageMembers = isOrgAdmin || userRole === 'tenant_admin';

  const handleAddMember = async (e) => {
    e.preventDefault();
    setActionError('');
    if (!email.trim() || !currentTenantId) return;

    try {
      await dispatch(
        addTenantMember({
          email: email.trim(),
          role,
          tenantId: currentTenantId,
        })
      ).unwrap();

      setEmail('');
      setRole('member');
      setIsModalOpen(false);
    } catch (err) {
      setActionError(err.message || 'Failed to add member to branch');
    }
  };

  const handleRoleChange = async (membershipId, newRole) => {
    await dispatch(updateMemberRole({ membershipId, role: newRole }));
  };

  const handleRemove = async (membershipId) => {
    if (window.confirm('Are you sure you want to remove this member from the branch?')) {
      await dispatch(removeTenantMember(membershipId));
    }
  };

  const getRoleBadge = (r) => {
    switch (r) {
      case 'org_admin':
        return { label: 'Org Admin', color: 'bg-purple-900/50 text-purple-300 border-purple-700/50' };
      case 'tenant_admin':
        return { label: 'Branch Admin', color: 'bg-blue-900/50 text-blue-300 border-blue-700/50' };
      default:
        return { label: 'Member', color: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50' };
    }
  };

  if (!currentTenantId || tenants.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <HiUsers className="w-6 h-6 text-indigo-400" />
            Branch Team Members
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage who has access to this branch's Kanban boards and tasks
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/60 border border-slate-800 rounded-3xl text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/20">
            <HiUsers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Branch Selected</h3>
          <p className="text-xs text-slate-400 max-w-md mb-6">
            Members are assigned to specific branches (tenants). Please create or select a branch first before adding team members.
          </p>
          <Link
            to="/tenants"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <span>Go to Branches / Tenants</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <HiUsers className="w-6 h-6 text-indigo-400" />
            Branch Team Members
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage who has access to this branch's Kanban boards and tasks
          </p>
        </div>

        {canManageMembers && (
          <button
            onClick={() => {
              setActionError('');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-indigo-600/30"
          >
            <HiUserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>Member ({members.length})</span>
          <span>Role & Actions</span>
        </div>

        <div className="divide-y divide-slate-800/70">
          {members.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No members found in this branch.
            </div>
          ) : (
            members.map((member) => {
              const badge = getRoleBadge(member.role);
              const isSelf = member.user?._id === currentUser?.id;

              return (
                <div
                  key={member.membershipId}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        member.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          member.user?.name || 'User'
                        )}&background=4f46e5&color=fff&bold=true&rounded=true`
                      }
                      alt={member.user?.name}
                      className="w-10 h-10 rounded-full bg-indigo-600 object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {member.user?.name}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <HiEnvelope className="w-3.5 h-3.5 text-slate-500" />
                        {member.user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {canManageMembers && member.role !== 'org_admin' ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.membershipId, e.target.value)
                        }
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="member">Member</option>
                        <option value="tenant_admin">Branch Admin</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    )}

                    {canManageMembers && member.role !== 'org_admin' && (
                      <button
                        onClick={() => handleRemove(member.membershipId)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                        title="Remove member from branch"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              Add Member to Branch
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter the registered email address of the team member to add them to this tenant.
            </p>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {actionError}
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  User Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Branch Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="member">Member (View boards, create & move tasks)</option>
                  <option value="tenant_admin">Branch Admin (Manage boards, columns, members)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/30"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantMembers;
