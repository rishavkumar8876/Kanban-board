import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiSquares2X2,
  HiPlus,
  HiPencil,
  HiTrash,
  HiShieldCheck,
  HiCheck,
} from 'react-icons/hi2';
import {
  fetchTenantsByOrg,
  createTenant,
  updateTenant,
  deleteTenant,
} from '../redux/slices/tenantSlice';
import { setCurrentTenant } from '../redux/slices/authSlice';

export const TenantManagement = () => {
  const dispatch = useDispatch();

  const { currentOrgId, currentTenantId, userRole } = useSelector((state) => state.auth);
  const { organizations } = useSelector((state) => state.organizations);
  const { tenants, loading } = useSelector((state) => state.tenants);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (currentOrgId) {
      dispatch(fetchTenantsByOrg(currentOrgId));
    }
  }, [dispatch, currentOrgId]);

  const activeOrg = organizations.find((o) => o._id === currentOrgId);

  const isOrgAdmin =
    userRole === 'org_admin' ||
    activeOrg?.userRole === 'org_admin' ||
    (organizations.length > 0 && organizations[0]._id === currentOrgId && organizations[0].userRole === 'org_admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editId) {
      await dispatch(updateTenant({ id: editId, data: { name, description } }));
    } else {
      await dispatch(createTenant({ name, organizationId: currentOrgId, description }));
    }

    setName('');
    setDescription('');
    setEditId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (tenant) => {
    setEditId(tenant._id);
    setName(tenant.name);
    setDescription(tenant.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        'WARNING: Deleting this tenant branch will permanently delete all its boards, columns, and tasks. Proceed?'
      )
    ) {
      await dispatch(deleteTenant(id));
    }
  };

  const handleSwitchTenant = (tenantId) => {
    dispatch(setCurrentTenant(tenantId));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <HiSquares2X2 className="w-6 h-6 text-cyan-400" />
            Branch / Tenant Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Independent data partitions for {activeOrg?.name || 'your organization'} with isolated boards, tasks, and member lists
          </p>
        </div>

        {isOrgAdmin && (
          <button
            onClick={() => {
              setEditId(null);
              setName('');
              setDescription('');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-cyan-600/30"
          >
            <HiPlus className="w-4 h-4" />
            <span>New Branch / Tenant</span>
          </button>
        )}
      </div>

      {tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/60 border border-slate-800 rounded-3xl text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center mb-4 shadow-lg shadow-cyan-600/20">
            <HiSquares2X2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Branches / Tenants Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mb-6">
            Organizations can have multiple branches (e.g. "Main Branch", "Engineering", "Design"). Create your first branch to start creating Kanban boards.
          </p>
          {isOrgAdmin ? (
            <button
              onClick={() => {
                setEditId(null);
                setName('');
                setDescription('');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition"
            >
              <HiPlus className="w-4 h-4" />
              <span>Create First Branch</span>
            </button>
          ) : (
            <p className="text-xs text-slate-500">Only an Organization Admin can create branches.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenants.map((tenant) => {
            const isSelected = tenant._id === currentTenantId;

            return (
              <div
                key={tenant._id}
                className={`p-5 rounded-2xl border transition relative bg-slate-900/90 ${
                  isSelected
                    ? 'border-cyan-500 ring-2 ring-cyan-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{tenant.name}</h3>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          Active Branch
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {tenant.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleSwitchTenant(tenant._id)}
                    disabled={isSelected}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      isSelected
                        ? 'bg-slate-800 text-slate-500 cursor-default'
                        : 'bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30'
                    }`}
                  >
                    {isSelected ? 'Currently Viewing' : 'Switch to Branch'}
                  </button>

                  {(isOrgAdmin || userRole === 'tenant_admin') && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(tenant)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Edit branch"
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                      {isOrgAdmin && (
                        <button
                          onClick={() => handleDelete(tenant._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                          title="Delete branch"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editId ? 'Edit Branch / Tenant' : 'Create New Branch / Tenant'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EU Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Responsibilities, department, or location details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                />
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-md shadow-cyan-600/30"
                >
                  {editId ? 'Save Changes' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;
