import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiBuildingOffice2,
  HiChevronUpDown,
  HiArrowRightOnRectangle,
  HiUser,
  HiCheck,
  HiShieldCheck,
  HiSquares2X2,
} from 'react-icons/hi2';
import { setCurrentOrg, setCurrentTenant, logout } from '../redux/slices/authSlice';
import { fetchOrganizations } from '../redux/slices/organizationSlice';
import { fetchTenantsByOrg } from '../redux/slices/tenantSlice';
import OnlinePresenceBar from '../components/OnlinePresenceBar';

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, userRole, currentOrgId, currentTenantId, memberships } = useSelector(
    (state) => state.auth
  );
  const { organizations } = useSelector((state) => state.organizations);
  const { tenants } = useSelector((state) => state.tenants);

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const orgRef = useRef(null);
  const tenantRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (orgRef.current && !orgRef.current.contains(e.target)) setOrgDropdownOpen(false);
      if (tenantRef.current && !tenantRef.current.contains(e.target)) setTenantDropdownOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  useEffect(() => {
    if (organizations.length > 0) {
      const exists = organizations.some((o) => o._id === currentOrgId);
      if (!currentOrgId || !exists) {
        dispatch(setCurrentOrg(organizations[0]._id));
      }
    }
  }, [dispatch, organizations, currentOrgId]);

  useEffect(() => {
    if (currentOrgId) {
      dispatch(fetchTenantsByOrg(currentOrgId));
    }
  }, [dispatch, currentOrgId]);

  useEffect(() => {
    if (tenants.length > 0) {
      const exists = tenants.some((t) => t._id === currentTenantId);
      if (!currentTenantId || !exists) {
        dispatch(setCurrentTenant(tenants[0]._id));
      }
    }
  }, [dispatch, tenants, currentTenantId]);

  const activeOrg = organizations.find((o) => o._id === currentOrgId) || organizations[0];
  const activeTenant = tenants.find((t) => t._id === currentTenantId) || tenants[0];

  const effectiveRole =
    userRole === 'org_admin' || activeOrg?.userRole === 'org_admin'
      ? 'org_admin'
      : userRole || activeOrg?.userRole || 'member';

  const getRoleBadge = (role) => {
    switch (role) {
      case 'org_admin':
        return { label: 'Org Admin', color: 'bg-purple-900/60 text-purple-300 border-purple-700/50' };
      case 'tenant_admin':
        return { label: 'Branch Admin', color: 'bg-blue-900/60 text-blue-300 border-blue-700/50' };
      default:
        return { label: 'Member', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50' };
    }
  };

  const badge = getRoleBadge(effectiveRole);

  const handleSelectOrg = (orgId) => {
    dispatch(setCurrentOrg(orgId));
    setOrgDropdownOpen(false);
  };

  const handleSelectTenant = (tenantId) => {
    dispatch(setCurrentTenant(tenantId));
    setTenantDropdownOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative" ref={orgRef}>
          <button
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-sm font-medium text-slate-200 transition"
          >
            <HiBuildingOffice2 className="w-4 h-4 text-indigo-400" />
            <span className="max-w-[140px] truncate">{activeOrg ? activeOrg.name : 'Select Org'}</span>
            <HiChevronUpDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {orgDropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Organizations
              </div>
              {organizations.map((org) => (
                <button
                  key={org._id}
                  onClick={() => handleSelectOrg(org._id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-700/60 transition ${org._id === currentOrgId ? 'text-indigo-400 font-medium' : 'text-slate-300'
                    }`}
                >
                  <span className="truncate">{org.name}</span>
                  {org._id === currentOrgId && <HiCheck className="w-4 h-4 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-slate-600 font-light">/</span>

        <div className="relative" ref={tenantRef}>
          <button
            onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-sm font-medium text-slate-200 transition"
          >
            <HiSquares2X2 className="w-4 h-4 text-cyan-400" />
            <span className="max-w-[140px] truncate">{activeTenant ? activeTenant.name : 'Select Branch'}</span>
            <HiChevronUpDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {tenantDropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Branches / Tenants
              </div>
              {tenants.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-400">No branches available</div>
              ) : (
                tenants.map((tenant) => (
                  <button
                    key={tenant._id}
                    onClick={() => handleSelectTenant(tenant._id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-700/60 transition ${tenant._id === currentTenantId ? 'text-cyan-400 font-medium' : 'text-slate-300'
                      }`}
                  >
                    <span className="truncate">{tenant.name}</span>
                    {tenant._id === currentTenantId && <HiCheck className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <OnlinePresenceBar />

        <span
          className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}
        >
          <HiShieldCheck className="w-3.5 h-3.5" />
          {badge.label}
        </span>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/50 transition"
          >
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff&bold=true&rounded=true`}
              alt={user?.name}
              className="w-8 h-8 rounded-full bg-indigo-600 object-cover border border-slate-600"
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-700/70">
                <p className="text-sm font-semibold text-slate-100 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/60 hover:text-white transition"
                >
                  <HiUser className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>
              </div>

              <div className="border-t border-slate-700/70 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <HiArrowRightOnRectangle className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
