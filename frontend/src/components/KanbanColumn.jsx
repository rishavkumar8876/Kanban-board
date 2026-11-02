import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { HiPlus, HiTrash } from 'react-icons/hi2';
import TaskCard from './TaskCard';

export const KanbanColumn = ({
  column,
  tasks = [],
  onAddTask,
  onTaskClick,
  onDeleteColumn,
  canManageColumns = false,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
    data: {
      type: 'Column',
      column,
    },
  });

  const taskIds = tasks.map((t) => t._id);

  return (
    <div
      ref={setNodeRef}
      className={`w-80 shrink-0 flex flex-col max-h-full bg-slate-900/80 border rounded-2xl shadow-sm transition-colors duration-150 ${
        isOver
          ? 'border-indigo-500 bg-slate-900/95 ring-2 ring-indigo-500/20'
          : 'border-slate-800/80'
      }`}
    >
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: column.color || '#6366f1' }}
          />
          <h3 className="text-sm font-bold text-slate-100 truncate max-w-[150px]">
            {column.title}
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddTask(column._id)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Add task to this column"
          >
            <HiPlus className="w-4 h-4" />
          </button>

          {canManageColumns && (
            <button
              onClick={() => onDeleteColumn(column._id)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Delete column"
            >
              <HiTrash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[150px] kanban-scroll">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-28 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400">
            Drop tasks here or click + to add
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
