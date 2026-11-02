import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiClock,
  HiArrowPath,
  HiFunnel,
  HiCheckCircle,
  HiSquares2X2,
} from 'react-icons/hi2';
import { fetchTenantActivities } from '../redux/slices/activitySlice';

export const ActivityLogs = () => {
  const dispatch = useDispatch();
  const { currentTenantId } = useSelector((state) => state.auth);
  const { activities, loading, pagination } = useSelector((state) => state.activities);

  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    if (currentTenantId) {
      dispatch(fetchTenantActivities({ tenantId: currentTenantId, limit: 100 }));
    }
  }, [dispatch, currentTenantId]);

  const handleRefresh = () => {
    if (currentTenantId) {
      dispatch(fetchTenantActivities({ tenantId: currentTenantId, limit: 100 }));
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (filterAction === 'ALL') return true;
    return act.action === filterAction;
  });

  const getActionBadge = (action) => {
    if (action.includes('CREATED')) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (action.includes('MOVED')) {
      return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    }
    if (action.includes('UPDATED')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    if (action.includes('DELETED') || action.includes('REMOVED')) {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <HiClock className="w-6 h-6 text-indigo-400" />
            Branch Activity Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time immutable log of task movements, column changes, and member events
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <HiArrowPath className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 text-xs">
        <HiFunnel className="w-4 h-4 text-slate-500 ml-1" />
        <span className="text-slate-400 font-medium">Filter Action:</span>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">All Actions</option>
          <option value="TASK_CREATED">Task Created</option>
          <option value="TASK_MOVED">Task Moved</option>
          <option value="TASK_UPDATED">Task Updated</option>
          <option value="TASK_DELETED">Task Deleted</option>
          <option value="COLUMN_CREATED">Column Created</option>
          <option value="MEMBER_ADDED">Member Added</option>
        </select>
        <span className="ml-auto text-slate-500 text-[11px]">
          Showing {filteredActivities.length} events
        </span>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No audit activities logged for this tenant branch yet.
          </div>
        ) : (
          <div className="relative border-l border-slate-800 ml-4 space-y-6">
            {filteredActivities.map((act) => (
              <div key={act._id} className="relative pl-6">
                <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-800 border-2 border-indigo-500"></span>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        act.userId?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          act.userId?.name || 'User'
                        )}&background=4f46e5&color=fff&bold=true&rounded=true`
                      }
                      alt={act.userId?.name}
                      className="w-8 h-8 rounded-full bg-slate-700 object-cover mt-0.5 shrink-0"
                    />

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">
                          {act.userId?.name || 'System / Collaborator'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getActionBadge(
                            act.action
                          )}`}
                        >
                          {act.action.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-1">
                        {act.metadata?.taskTitle && (
                          <span>
                            Task: <span className="text-white font-medium">"{act.metadata.taskTitle}"</span>{' '}
                          </span>
                        )}
                        {act.metadata?.targetColumn && (
                          <span className="text-cyan-400">
                            → moved to {act.metadata.targetColumn}
                          </span>
                        )}
                        {act.metadata?.boardTitle && (
                          <span>
                            Board: <span className="text-white font-medium">"{act.metadata.boardTitle}"</span>
                          </span>
                        )}
                        {act.metadata?.columnTitle && (
                          <span>
                            Stage: <span className="text-white font-medium">"{act.metadata.columnTitle}"</span>
                          </span>
                        )}
                        {act.metadata?.memberName && (
                          <span>
                            Member: <span className="text-white font-medium">{act.metadata.memberName}</span> ({act.metadata.role})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 shrink-0 self-end sm:self-center">
                    {new Date(act.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
