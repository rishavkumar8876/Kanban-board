import React from 'react';
import { useSelector } from 'react-redux';
import { HiUserGroup } from 'react-icons/hi2';

export const OnlinePresenceBar = () => {
  const { onlineUsers, count } = useSelector((state) => state.presence);

  if (!onlineUsers || onlineUsers.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60">
        <span className="w-2 h-2 rounded-full bg-slate-500"></span>
        <span>No active collaborators</span>
      </div>
    );
  }

  const displayedUsers = onlineUsers.slice(0, 4);
  const remainingCount = Math.max(0, onlineUsers.length - 4);

  return (
    <div className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-sm border border-slate-700/80 px-3 py-1.5 rounded-full shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-medium text-emerald-400">
          {count} {count === 1 ? 'online' : 'online'}
        </span>
      </div>

      <div className="flex items-center -space-x-2 overflow-hidden ml-1">
        {displayedUsers.map((user) => (
          <div
            key={user._id}
            title={`${user.name} (${user.email})`}
            className="relative inline-block"
          >
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff&bold=true&rounded=true`}
              alt={user.name}
              className="w-7 h-7 rounded-full border-2 border-slate-800 object-cover bg-indigo-600"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-slate-900 rounded-full"></span>
          </div>
        ))}

        {remainingCount > 0 && (
          <div
            title={`${remainingCount} more online`}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-800 text-[10px] font-bold text-slate-200"
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlinePresenceBar;
