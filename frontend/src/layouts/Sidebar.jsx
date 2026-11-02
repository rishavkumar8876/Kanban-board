import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HiOutlineViewColumns,
  HiOutlineSquares2X2,
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineUserCircle,
  HiOutlineChartBarSquare,
} from 'react-icons/hi2';

export const Sidebar = () => {
  const { userRole } = useSelector((state) => state.auth);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: HiOutlineChartBarSquare },
    { name: 'Kanban Board', path: '/board', icon: HiOutlineViewColumns },
    { name: 'Branches', path: '/tenants', icon: HiOutlineSquares2X2 },
    { name: 'Team Members', path: '/members', icon: HiOutlineUsers },
    { name: 'Organizations', path: '/organizations', icon: HiOutlineBuildingOffice2 },
    { name: 'Activity Logs', path: '/activities', icon: HiOutlineClock },
    { name: 'Profile', path: '/profile', icon: HiOutlineUserCircle },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <HiOutlineViewColumns className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Kanban Board</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Multi-Tenant SaaS</p>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-400">Real-Time Sync</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Socket.IO
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Concurrency</span>
          <span className="text-indigo-400 font-medium">OCC Enabled</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
