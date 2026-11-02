import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiXMark,
  HiTrash,
  HiClock,
  HiUser,
  HiFlag,
  HiChatBubbleLeftRight,
  HiCheckCircle,
  HiShieldCheck,
} from 'react-icons/hi2';
import {
  clearActiveTask,
  updateTask,
  deleteTask,
  addComment,
} from '../redux/slices/taskSlice';

export const TaskDetailModal = () => {
  const dispatch = useDispatch();
  const { activeTask } = useSelector((state) => state.tasks);
  const { columns } = useSelector((state) => state.boards);
  const { members } = useSelector((state) => state.tenants);
  const { user } = useSelector((state) => state.auth);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [columnId, setColumnId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (activeTask) {
      setTitle(activeTask.title || '');
      setDescription(activeTask.description || '');
      setPriority(activeTask.priority || 'Medium');
      setColumnId(activeTask.columnId?._id || activeTask.columnId || '');
      setAssignedTo(activeTask.assignedTo?._id || activeTask.assignedTo || '');
      setDueDate(
        activeTask.dueDate ? new Date(activeTask.dueDate).toISOString().split('T')[0] : ''
      );
    }
  }, [activeTask]);

  if (!activeTask) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await dispatch(
        updateTask({
          id: activeTask._id,
          data: {
            version: activeTask.version,
            title,
            description,
            priority,
            columnId,
            assignedTo: assignedTo || null,
            dueDate: dueDate || null,
          },
        })
      ).unwrap();

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await dispatch(
        addComment({
          id: activeTask._id,
          content: commentText.trim(),
        })
      ).unwrap();
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await dispatch(deleteTask(activeTask._id));
      dispatch(clearActiveTask());
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'High':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Low':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(
                priority
              )}`}
            >
              {priority} Priority
            </span>
            <span className="flex items-center gap-1 text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-md">
              <HiShieldCheck className="w-3.5 h-3.5" />
              v{activeTask.version} OCC
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Delete Task"
            >
              <HiTrash className="w-5 h-5" />
            </button>
            <button
              onClick={() => dispatch(clearActiveTask())}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsEditing(true);
                }}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-base font-semibold text-white focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Stage Column</label>
                <select
                  value={columnId}
                  onChange={(e) => {
                    setColumnId(e.target.value);
                    setIsEditing(true);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {columns.map((col) => (
                    <option key={col._id} value={col._id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    setIsEditing(true);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Member</label>
                <select
                  value={assignedTo}
                  onChange={(e) => {
                    setAssignedTo(e.target.value);
                    setIsEditing(true);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user?._id || m.membershipId} value={m.user?._id}>
                      {m.user?.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    setIsEditing(true);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsEditing(true);
                }}
                placeholder="Add more details, requirements, or acceptance criteria..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>

            {isEditing && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-amber-400">Unsaved changes</span>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/30"
                >
                  Save Task Changes
                </button>
              </div>
            )}

            {saveSuccess && (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                <HiCheckCircle className="w-4 h-4" />
                Task updated and version incremented!
              </div>
            )}
          </form>

          <div className="border-t border-slate-800 pt-5">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-3">
              <HiChatBubbleLeftRight className="w-4 h-4 text-indigo-400" />
              Activity & Comments ({activeTask.comments?.length || 0})
            </h4>

            <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1">
              {(!activeTask.comments || activeTask.comments.length === 0) && (
                <p className="text-xs text-slate-500 italic">No comments yet. Start the conversation!</p>
              )}
              {activeTask.comments?.map((comment) => (
                <div
                  key={comment._id}
                  className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl flex items-start gap-3"
                >
                  <img
                    src={
                      comment.userAvatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        comment.userName || 'User'
                      )}&background=4f46e5&color=fff&bold=true&rounded=true`
                    }
                    alt={comment.userName}
                    className="w-7 h-7 rounded-full bg-slate-700 object-cover mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{comment.userName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
