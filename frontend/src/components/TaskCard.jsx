import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  HiBars2,
  HiClock,
  HiChatBubbleLeft,
  HiShieldCheck,
  HiExclamationCircle,
} from 'react-icons/hi2';

export const TaskCard = ({ task, onClick, isOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: 'Task',
      task,
    },
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'High':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Low':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-700/50 text-slate-400 border-slate-600';
    }
  };

  let formattedDueDate = null;
  let isOverdue = false;
  if (task.dueDate) {
    const due = new Date(task.dueDate);
    formattedDueDate = due.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    isOverdue = due < new Date() && !['Done', 'done'].includes(task.columnId?.title);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-slate-800/95 hover:bg-slate-800 border rounded-xl p-3.5 shadow-sm transition-all duration-200 cursor-pointer select-none ${
        isDragging
          ? 'opacity-40 border-indigo-500/70 shadow-indigo-500/20'
          : 'border-slate-700/70 hover:border-slate-600 hover:shadow-md'
      } ${isOverlay ? 'shadow-2xl border-indigo-500 ring-2 ring-indigo-500/40 rotate-1 scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getPriorityBadge(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
          <span
            title="Optimistic Concurrency Control Version"
            className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700 flex items-center gap-0.5"
          >
            <HiShieldCheck className="w-3 h-3 text-indigo-400" />
            v{task.version}
          </span>
        </div>

        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="text-slate-400 hover:text-slate-200 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-700/60 transition"
          title="Drag to reorder or move"
        >
          <HiBars2 className="w-4 h-4" />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition line-clamp-2 leading-snug">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-700/50 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          {formattedDueDate && (
            <span
              className={`flex items-center gap-1 font-medium ${
                isOverdue ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {isOverdue ? (
                <HiExclamationCircle className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <HiClock className="w-3.5 h-3.5 text-slate-400" />
              )}
              {formattedDueDate}
            </span>
          )}

          {task.comments && task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-slate-400">
              <HiChatBubbleLeft className="w-3.5 h-3.5" />
              {task.comments.length}
            </span>
          )}
        </div>

        {task.assignedTo ? (
          <div className="flex items-center gap-1.5" title={task.assignedTo.name}>
            <img
              src={
                task.assignedTo.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  task.assignedTo.name
                )}&background=4f46e5&color=fff&bold=true&rounded=true`
              }
              alt={task.assignedTo.name}
              className="w-5 h-5 rounded-full object-cover border border-slate-600 bg-slate-700"
            />
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 italic">Unassigned</span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
