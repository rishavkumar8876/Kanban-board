import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
  HiPlus,
  HiMagnifyingGlass,
  HiFunnel,
  HiSquares2X2,
  HiSquare2Stack,
  HiChevronDown,
  HiBuildingOffice2,
} from 'react-icons/hi2';

import {
  fetchBoardsByTenant,
  fetchBoardDetails,
  deleteColumn,
} from '../redux/slices/boardSlice';
import {
  fetchTasksByBoard,
  moveTask,
  setActiveTask,
  optimisticMoveTask,
} from '../redux/slices/taskSlice';
import { fetchTenantMembers } from '../redux/slices/tenantSlice';

import KanbanColumn from '../components/KanbanColumn';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import CreateColumnModal from '../components/CreateColumnModal';
import CreateBoardModal from '../components/CreateBoardModal';

export const KanbanBoardPage = () => {
  const dispatch = useDispatch();

  const { currentTenantId, userRole } = useSelector((state) => state.auth);
  const { organizations } = useSelector((state) => state.organizations);
  const { tenants, members } = useSelector((state) => state.tenants);
  const { boards, currentBoard, columns, loading: boardLoading } = useSelector(
    (state) => state.boards
  );
  const { tasks } = useSelector((state) => state.tasks);

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalColumnId, setTaskModalColumnId] = useState(null);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);

  const [activeTaskDrag, setActiveTaskDrag] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    if (currentTenantId) {
      dispatch(fetchBoardsByTenant(currentTenantId));
      dispatch(fetchTenantMembers(currentTenantId));
    }
  }, [dispatch, currentTenantId]);

  useEffect(() => {
    if (boards.length > 0 && !currentBoard) {
      dispatch(fetchBoardDetails(boards[0]._id));
    } else if (currentBoard) {
      dispatch(fetchTasksByBoard(currentBoard._id));
    }
  }, [dispatch, boards, currentBoard?._id]);

  const handleSelectBoard = (boardId) => {
    dispatch(fetchBoardDetails(boardId));
  };

  const handleOpenCreateTask = (columnId = null) => {
    setTaskModalColumnId(columnId);
    setIsTaskModalOpen(true);
  };

  const handleDeleteColumn = (columnId) => {
    if (window.confirm('Are you sure you want to delete this column and its tasks?')) {
      dispatch(deleteColumn(columnId));
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority =
      priorityFilter === 'ALL' || task.priority === priorityFilter;

    const matchesAssignee =
      assigneeFilter === 'ALL'
        ? true
        : assigneeFilter === 'UNASSIGNED'
        ? !task.assignedTo
        : task.assignedTo?._id === assigneeFilter;

    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const getTasksByColumn = (columnId) => {
    return filteredTasks
      .filter((t) => (t.columnId?._id || t.columnId) === columnId)
      .sort((a, b) => a.position - b.position);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTaskDrag(task);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t._id === activeId);
    if (!activeTask) return;

    const overColumn = columns.find((c) => c._id === overId);
    const overTask = tasks.find((t) => t._id === overId);

    const targetColumnId = overColumn
      ? overColumn._id
      : overTask
      ? (overTask.columnId?._id || overTask.columnId)
      : null;

    if (!targetColumnId) return;

    const currentColumnId = activeTask.columnId?._id || activeTask.columnId;

    if (currentColumnId !== targetColumnId) {
      dispatch(
        optimisticMoveTask({
          taskId: activeId,
          targetColumnId,
          newPosition: 0,
        })
      );
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTaskDrag(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find((t) => t._id === activeId);
    if (!activeTask) return;

    const overColumn = columns.find((c) => c._id === overId);
    const overTask = tasks.find((t) => t._id === overId);

    const targetColumnId = overColumn
      ? overColumn._id
      : overTask
      ? (overTask.columnId?._id || overTask.columnId)
      : null;

    if (!targetColumnId) return;

    const columnTasks = getTasksByColumn(targetColumnId);
    let newIndex = 0;

    if (overTask) {
      const overIndex = columnTasks.findIndex((t) => t._id === overId);
      newIndex = overIndex >= 0 ? overIndex : 0;
    } else {
      newIndex = columnTasks.length;
    }

    dispatch(
      optimisticMoveTask({
        taskId: activeId,
        targetColumnId,
        newPosition: newIndex,
      })
    );

    try {
      await dispatch(
        moveTask({
          id: activeId,
          targetColumnId,
          position: newIndex,
          version: activeTask.version,
        })
      ).unwrap();
    } catch (error) {
      console.warn('Task move returned response/conflict:', error);
    }
  };

  const canManage = userRole === 'org_admin' || userRole === 'tenant_admin' || organizations.length === 0;

  if (organizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-slate-900/60 border border-slate-800 rounded-3xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/20">
          <HiBuildingOffice2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Welcome to Kanban Board!</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          You don't have any organizations yet. Create your first organization to establish your multi-tenant workspace.
        </p>
        <Link
          to="/organizations"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          Create First Organization
        </Link>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-slate-900/60 border border-slate-800 rounded-3xl">
        <div className="w-16 h-16 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center mb-4 shadow-lg shadow-cyan-600/20">
          <HiSquares2X2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Create Your First Branch / Tenant</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Organizations can have multiple branches (e.g. Engineering, Product, Marketing). Create your first branch to start organizing boards.
        </p>
        <Link
          to="/tenants"
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition"
        >
          Create First Branch
        </Link>
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-slate-900/60 border border-slate-800 rounded-3xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/20">
          <HiSquare2Stack className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Boards in this Branch Yet</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Create your first Kanban board. Standard columns (To Do, In Progress, Review, Done) will be automatically generated.
        </p>
        <button
          onClick={() => setIsBoardModalOpen(true)}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          Create First Board
        </button>
        <CreateBoardModal
          isOpen={isBoardModalOpen}
          onClose={() => setIsBoardModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={currentBoard?._id || ''}
              onChange={(e) => handleSelectBoard(e.target.value)}
              className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 pr-8 text-base font-bold text-white appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 transition"
            >
              {boards.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.title}
                </option>
              ))}
            </select>
            <HiChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {canManage && (
            <button
              onClick={() => setIsBoardModalOpen(true)}
              className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 text-slate-300 transition"
              title="Create new Kanban board"
            >
              <HiSquare2Stack className="w-5 h-5 text-indigo-400" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {canManage && (
            <button
              onClick={() => setIsColumnModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 transition shadow-sm"
            >
              <HiSquares2X2 className="w-4 h-4 text-indigo-400" />
              <span>Add Stage Column</span>
            </button>
          )}

          <button
            onClick={() => handleOpenCreateTask()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/30"
          >
            <HiPlus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80 text-xs">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <HiMagnifyingGlass className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/70 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <HiFunnel className="w-4 h-4 text-slate-500" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/70 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/70 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Assignees</option>
            <option value="UNASSIGNED">Unassigned</option>
            {members.map((m) => (
              <option key={m.user?._id || m.membershipId} value={m.user?._id}>
                {m.user?.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 kanban-scroll">
        {boardLoading ? (
          <div className="flex items-center justify-center h-64 text-sm text-slate-500">
            Loading Kanban board...
          </div>
        ) : columns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-slate-400 text-sm mb-3">No columns configured for this board yet.</p>
            {canManage && (
              <button
                onClick={() => setIsColumnModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
              >
                Add First Column
              </button>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-start gap-4 h-full min-w-max">
              {columns.map((column) => (
                <KanbanColumn
                  key={column._id}
                  column={column}
                  tasks={getTasksByColumn(column._id)}
                  onAddTask={handleOpenCreateTask}
                  onTaskClick={(task) => dispatch(setActiveTask(task))}
                  onDeleteColumn={handleDeleteColumn}
                  canManageColumns={canManage}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTaskDrag ? (
                <TaskCard task={activeTaskDrag} isOverlay={true} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        initialColumnId={taskModalColumnId}
      />
      <CreateColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
      />
      <CreateBoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
      />
    </div>
  );
};

export default KanbanBoardPage;
