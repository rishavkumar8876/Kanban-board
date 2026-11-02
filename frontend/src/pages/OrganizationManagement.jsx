import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiBuildingOffice2,
  HiPlus,
  HiShieldCheck,
  HiTrash,
  HiPencil,
  HiCheck,
} from 'react-icons/hi2';
import {
  fetchOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '../redux/slices/organizationSlice';
import { setCurrentOrg } from '../redux/slices/authSlice';

export const OrganizationManagement = () => {
  const dispatch = useDispatch();
  const { organizations, loading } = useSelector((state) => state.organizations);
  const { currentOrgId, userRole } = useSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editId) {
      await dispatch(updateOrganization({ id: editId, data: { name, description } }));
    } else {
      const created = await dispatch(createOrganization({ name, description })).unwrap();
      if (created?._id) {
        dispatch(setCurrentOrg(created._id));
        dispatch(fetchOrganizations());
      }
    }

    setName('');
    setDescription('');
    setEditId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (org) => {
    setEditId(org._id);
    setName(org.name);
    setDescription(org.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('WARNING: Deleting this organization will permanently cascade delete all branches, boards, columns, and tasks. Proceed?')) {
      await dispatch(deleteOrganization(id));
    }
  };

  const handleSwitchOrg = (id) => {
    dispatch(setCurrentOrg(id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <HiBuildingOffice2 className="w-6 h-6 text-indigo-400" />
            Organizations Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Top-level organizational structures and tenant boundaries
          </p>
        </div>

        <button
          onClick={() => {
            setEditId(null);
            setName('');
            setDescription('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-indigo-600/30"
        >
          <HiPlus className="w-4 h-4" />
          <span>New Organization</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {organizations.map((org) => {
          const isSelected = org._id === currentOrgId;
          const isOrgAdmin = org.userRole === 'org_admin';

          return (
            <div
              key={org._id}
              className={`p-5 rounded-2xl border transition relative bg-slate-900/90 ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{org.name}</h3>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {org.description || 'No description provided.'}
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <HiShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  {org.userRole}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleSwitchOrg(org._id)}
                  disabled={isSelected}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    isSelected
                      ? 'bg-slate-800 text-slate-500 cursor-default'
                      : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30'
                  }`}
                >
                  {isSelected ? 'Current Workspace' : 'Switch to Org'}
                </button>

                {isOrgAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(org)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      title="Edit organization"
                    >
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(org._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                      title="Delete organization"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editId ? 'Edit Organization' : 'Create New Organization'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Global"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Industry, company scope, or team purpose..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/30"
                >
                  {editId ? 'Save Changes' : 'Create Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManagement;
