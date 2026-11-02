import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import TaskDetailModal from '../components/TaskDetailModal';
import ConflictModal from '../components/ConflictModal';
import useSocketListeners from '../hooks/useSocketListeners';

export const AppLayout = () => {

  useSocketListeners();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-slate-900/60 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <TaskDetailModal />
      <ConflictModal />
    </div>
  );
};

export default AppLayout;
