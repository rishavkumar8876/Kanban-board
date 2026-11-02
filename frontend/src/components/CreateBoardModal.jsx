import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HiXMark, HiSquare2Stack } from 'react-icons/hi2';
import { createBoard } from '../redux/slices/boardSlice';

export const CreateBoardModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { currentTenantId } = useSelector((state) => state.auth);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !currentTenantId) return;

    setLoading(true);
    try {
      await dispatch(
        createBoard({
          title: title.trim(),
          description: description.trim(),
          tenantId: currentTenantId,
        })
      ).unwrap();

      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Failed to create board:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <HiSquare2Stack className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Create New Board</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Board Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Q1 Growth & Infrastructure"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Objectives, team focus, or milestone details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            Default columns (<span className="text-indigo-400">To Do</span>, <span className="text-sky-400">In Progress</span>, <span className="text-amber-400">Review</span>, <span className="text-emerald-400">Done</span>) will be automatically created.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;
