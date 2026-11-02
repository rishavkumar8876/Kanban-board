import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  HiOutlineViewColumns,
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiArrowRight,
  HiShieldCheck,
  HiSparkles,
} from 'react-icons/hi2';

import { fetchBoardsByTenant } from '../redux/slices/boardSlice';
import { fetchTenantMembers } from '../redux/slices/tenantSlice';
import { fetchTenantActivities } from '../redux/slices/activitySlice';
import { fetchTasksByBoard } from '../redux/slices/taskSlice';

export const Dashboard = () => {
  const dispatch = useDispatch();

  const { user, userRole, currentTenantId, currentOrgId } = useSelector((state) => state.auth);
  const { organizations } = useSelector((state) => state.organizations);
  const { tenants, members } = useSelector((state) => state.tenants);
  const { boards, currentBoard } = useSelector((state) => state.boards);
  const { tasks } = useSelector((state) => state.tasks);
  const { activities } = useSelector((state) => state.activities);
  const { count: onlineCount } = useSelector((state) => state.presence);

  const activeOrg = organizations.find((o) => o._id === currentOrgId) || organizations[0];
  const activeTenant = tenants.find((t) => t._id === currentTenantId) || tenants[0];

  const effectiveRole =
    userRole === 'org_admin' || activeOrg?.userRole === 'org_admin'
      ? 'org_admin'
      : userRole || activeOrg?.userRole || 'member';

  useEffect(() => {
    if (currentTenantId) {
      dispatch(fetchBoardsByTenant(currentTenantId));
      dispatch(fetchTenantMembers(currentTenantId));
      dispatch(fetchTenantActivities({ tenantId: currentTenantId, limit: 10 }));
    }
  }, [dispatch, currentTenantId]);

  useEffect(() => {
    if (currentBoard) {
      dispatch(fetchTasksByBoard(currentBoard._id));
    }
  }, [dispatch, currentBoard]);

  const completedTasks = tasks.filter((t) => ['Done', 'done'].includes(t.columnId?.title)).length;
  const inProgressTasks = tasks.filter((t) => ['In Progress', 'in progress', 'Review'].includes(t.columnId?.title)).length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            <HiSparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multi-Tenant Enterprise Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || 'Engineer'}
          </h1>
          <p className="text-sm text-slate-300 mt-2">
            Currently working in{' '}
            <span className="font-bold text-indigo-300">{activeOrg?.name || 'Organization'}</span>
            {activeTenant?.name ? (
              <> / <span className="font-bold text-cyan-300">{activeTenant.name}</span></>
            ) : (
              <> (<span className="text-cyan-300 font-medium">All Branches</span>)</>
            )}{' '}
            with role{' '}
            <span className="font-semibold uppercase tracking-wider text-xs px-2.5 py-1 rounded bg-slate-800 text-indigo-300 border border-slate-700">
              {effectiveRole.replace(/_/g, ' ')}
            </span>.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/board"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
          >
            <span>Open Kanban Board</span>
            <HiArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/members"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <span>Team Members</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Tenant Boards</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <HiOutlineViewColumns className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{boards.length}</div>
          <p className="text-xs text-slate-500 mt-1">Active in {activeTenant?.name}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <HiOutlineClock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-cyan-400 mt-2">{inProgressTasks}</div>
          <p className="text-xs text-slate-500 mt-1">Sprint tasks in motion</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Tasks Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <HiOutlineCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{completedTasks}</div>
          <p className="text-xs text-slate-500 mt-1">Successfully deployed</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Live Presence</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <HiOutlineUsers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-2xl font-bold text-white">{onlineCount}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Active in this branch</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HiOutlineClock className="w-5 h-5 text-indigo-400" />
              Live Branch Audit Stream
            </h2>
            <Link to="/activities" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No recent activity logged in this tenant.</p>
            ) : (
              activities.slice(0, 6).map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.userId?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          item.userId?.name || 'User'
                        )}&background=4f46e5&color=fff&bold=true&rounded=true`
                      }
                      alt={item.userId?.name}
                      className="w-7 h-7 rounded-full bg-slate-700 object-cover"
                    />
                    <div>
                      <p className="text-slate-200">
                        <span className="font-bold text-white">{item.userId?.name || 'Collaborator'}</span>{' '}
                        {item.action.toLowerCase().replace(/_/g, ' ')}:{' '}
                        <span className="text-indigo-300 font-medium">
                          {item.metadata?.taskTitle || item.metadata?.boardTitle || item.metadata?.columnTitle || item.entityType}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <HiShieldCheck className="w-5 h-5 text-emerald-400" />
            Security & Isolation
          </h2>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="font-bold text-indigo-400 block mb-1">Strict Tenant Isolation</span>
              All database queries enforce <code className="text-[11px] bg-slate-900 px-1 py-0.5 rounded">organizationId</code> and <code className="text-[11px] bg-slate-900 px-1 py-0.5 rounded">tenantId</code> scope.
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">Optimistic Concurrency (OCC)</span>
              Every task mutation increments a version integer. Simultaneous edits trigger HTTP 409 Conflict protection.
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="font-bold text-cyan-400 block mb-1">Real-Time Tenant Rooms</span>
              Socket events and live presence are isolated exclusively to users verified in this tenant room.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
