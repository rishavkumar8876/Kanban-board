import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HiExclamationTriangle, HiXMark, HiArrowPath } from 'react-icons/hi2';
import { clearConflict, fetchTasksByBoard } from '../redux/slices/taskSlice';

export const ConflictModal = () => {
  const dispatch = useDispatch();
  const { isConflictModalOpen, conflictTask } = useSelector((state) => state.tasks);
  const { currentBoard } = useSelector((state) => state.boards);

  if (!isConflictModalOpen || !conflictTask) return null;

  const handleReload = () => {
    if (currentBoard) {
      dispatch(fetchTasksByBoard(currentBoard._id));
    }
    dispatch(clearConflict());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <HiExclamationTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-400">Concurrent Edit Conflict (HTTP 409)</h3>
              <p className="text-xs text-slate-400">Optimistic Concurrency Control Triggered</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(clearConflict())}
            className="text-slate-400 hover:text-white transition"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 text-sm text-slate-300 space-y-3">
          <p>
            Another collaborator modified this task while you were editing it. Your changes were rejected to prevent overwriting their work.
          </p>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Task:</span>
              <span className="font-semibold text-slate-200">{conflictTask.title}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Current Server Version:</span>
              <span className="font-mono text-amber-400 font-bold">v{conflictTask.version}</span>
            </div>
            {conflictTask.updatedBy && (
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Last Updated By:</span>
                <span className="text-slate-300">{conflictTask.updatedBy.name || 'Another user'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => dispatch(clearConflict())}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Dismiss
          </button>
          <button
            onClick={handleReload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
          >
            <HiArrowPath className="w-4 h-4" />
            Reload Latest State
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;
